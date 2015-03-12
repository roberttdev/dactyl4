#
# Extraction: Less a class representing an object, and more of a set of two processes (assemble_XX_from_query) for generating extraction.  Other methods are broken
#             out more or less to increase reading comprehension by separating these two processes into sub-task, because there's a lot of code here.
#
class Extraction
  require 'csv'

  attr_reader :filename #Tracks file containing output

  @backbone_ids_index   #Hash of sets mapping a document ID to the set of group IDs composing its backbone
  @backbone_id_string   #Comma separated string of all backbone group ids -- better for performance to run once and store class-wide
  @backbone_data        #Hash of backbone data: key is document ID then group ID, contains group-level data and array of annotation data
  @flattened_data       #Hash of flattened data: key is document ID then backbone parent group ID, contains


  def initialize
    @backbone_ids_index = {}
    @backbone_data = {}
    @flattened_data = {}
  end

  #Take in parameters and generate new extraction in JSON format
  #Endpoint: String representing annotation title
  #Filters: Hash consisting of annotation title(s) and value(s)
  #Account_id: account to provide access to the resulting annotations to
  def assemble_json_from_query( endpoint, filters, account_id )

  end

  #Take in parameters and generate new extraction in CSV format, returning filename
  #Endpoint: String representing annotation title
  #Filters: Hash consisting of annotation title(s) and value(s)
  #Account_id: account to provide access to the resulting annotations to
  def assemble_csv_from_query( endpoints, filters, account_id )
    #Step 1: Collect all IDs of endpoint groups and backbone groups
    endpoint_hash = get_endpoint_hash(endpoints, filters)
    extract_backbone_ids(endpoint_hash)

    #Step 2: Extract full group/data point info for all data in backbone groups
    generate_backbone_structure()

    #Step 3: Find base groups for all docs retrieved, and use them to start recursive merge process
    perform_backbone_merges()

    #Step 4: Extract flattened data for non-backbone groups
    extract_flattened_data()

    #Step 5: Build table structure from backbone and flattened data
    final_table = build_table(endpoint_hash)

    #Step 6: Convert to CSV file
    create_csv(final_table)

    checkpoint_holder = true

    return @filename
  end




  private

  #Builds the CSV table from the data populated in memory
  #Endpoint_hash contains a series of id, parent_id, and document_id fields, indicating a group, its parent, and its document.
  #Endpoint_hash SHOULD BE ORDERED BY DOCUMENT ID or memory-saving logic will hack the structure apart!
  def build_table(endpoint_hash)
    final_table = ExtractionTable.new()
    last_doc_id = nil

    endpoint_hash.each do |endpoint|
      curr_bb_grp = @backbone_data[endpoint['document_id']][endpoint['id']]

      #If we've moved on to a new doc, remove the old data to save memory/processing later
      if last_doc_id != endpoint['document_id']
        if !last_doc_id.nil?
          @backbone_data.delete(last_doc_id)
          @flattened_data.delete(last_doc_id)
          final_table.clear_cache()
        end
        last_doc_id = endpoint['document_id']
      end

      final_table.new_row()
      final_table.add_group_data(endpoint['id'], curr_bb_grp, nil)

      #Add backbone/flattened data
      curr_bb_grp = @backbone_data[endpoint['document_id']][endpoint['parent_id']]
      grp_id = endpoint['parent_id']
      while !grp_id.nil?
        flat_data = @flattened_data[endpoint['document_id']][grp_id]
        final_table.add_group_data(grp_id, curr_bb_grp, flat_data) if !(curr_bb_grp[:annos].length == 0 && flat_data.nil?)
        grp_id = curr_bb_grp[:parent_id]
        curr_bb_grp = @backbone_data[endpoint['document_id']][grp_id]
      end
    end

    return final_table
  end

  #Turn an extraction table into a CSV file
  def create_csv(table)
    time = Time.new()
    @filename = "/csv/#{time.year}#{time.month}#{time.day}#{time.hour}#{time.min}#{time.sec}#{time.usec}.csv"
    CSV.open("public#{@filename}", "w") do |csv|
      csv << table.column_data
      table.row_data.each do |row|
        csv << row
      end
    end
  end

  #Populates backbone ID tracking objects @backbone_ids_index and @backbone_ids_string with unique group IDs that form the backbones of a group hash
  #Endpoint_hash contains a series of id, parent_id, and document_id fields, indicating a group, its parent, and its document.
  def extract_backbone_ids(endpoint_hash)
    parent_ids = Set.new()
    all_ids = []
    group_hash = endpoint_hash.clone

    while !group_hash.nil?
      group_hash.each do |group|
        @backbone_ids_index[group['document_id']] = Set.new() if @backbone_ids_index[group['document_id']].nil?
        if !@backbone_ids_index[group['document_id']].include?(group['id'])
          @backbone_ids_index[group['document_id']].add(group['id'])
          all_ids << group['id']
          parent_ids.add(group['parent_id']) if !group['parent_id'].nil? && !parent_ids.include?(group['parent_id']) && !@backbone_ids_index[group['document_id']].include?(group['parent_id'])
        end
      end

      if parent_ids.length > 0
        group_hash = ActiveRecord::Base.connection.exec_query("SELECT id, parent_id, document_id FROM groups WHERE id IN (#{parent_ids.to_a.join(',')})")
        parent_ids = Set.new()
      else
        group_hash = nil
      end
    end

    @backbone_id_string = all_ids.join(',')
  end

  # Populates @flattened_data with all non-backbone data.  Result will be a hash with a document ID key pointing to a hash where multiple keys
  # (one for each group ID composing the result) will point to a single array containing all groups/points in the tree.
  def extract_flattened_data
    flattened_sql = <<-EOS
      SELECT g.id AS group_id, g.parent_id, g.document_id, g.name, a.title, a.content
      FROM (SELECT g1.id, g1.parent_id, g1.document_id, g1.name
        FROM groups g1 WHERE g1.parent_id IN (#{@backbone_id_string}) AND g1.id NOT IN (#{@backbone_id_string})) g
      LEFT JOIN annotation_groups ag on g.id=ag.group_id AND ag.qa_approved_by IS NOT NULL
      LEFT JOIN annotations a ON ag.annotation_id=a.id
      ORDER BY g.document_id, g.id
    EOS
    flat_point_hash = ActiveRecord::Base.connection.exec_query(flattened_sql)

    while !flat_point_hash.nil?
      last_docid = nil
      last_groupid = nil
      group_id_array = []
      flat_point_hash.each do |point|
        if last_docid != point['document_id']
          @flattened_data[point['document_id']] = {} if @flattened_data[point['document_id']].nil?
          last_docid = point['document_id']
        end

        #If this group's object doesn't exist, point to its parent's object.  If no parent object, create new object
        if point['group_id'] != last_groupid
          if @flattened_data[point['document_id']][point['parent_id']].nil?
            @flattened_data[point['document_id']][point['parent_id']] = []
          end

          @flattened_data[point['document_id']][point['group_id']] = @flattened_data[point['document_id']][point['parent_id']]
          @flattened_data[point['document_id']][point['group_id']] << {name: point['name'], id: point['group_id'], annos: []}

          last_groupid = point['group_id']
          group_id_array << last_groupid
        end

        group_array = @flattened_data[point['document_id']][point['group_id']]
        group_array[group_array.length - 1][:annos] << {title: point['title'], content: point['content']} if !point['title'].nil?
      end

      if group_id_array.length > 0
        flattened_sql = <<-EOS
          SELECT g.id AS group_id, g.parent_id, g.document_id, g.name, a.title, a.content
          FROM (SELECT g1.id, g1.parent_id, g1.document_id, g1.name
            FROM groups g1 WHERE g1.parent_id IN (#{group_id_array.join(',')})) g
          LEFT JOIN annotation_groups ag on g.id=ag.group_id AND ag.qa_approved_by IS NOT NULL
          LEFT JOIN annotations a ON ag.annotation_id=a.id
          ORDER BY g.document_id, g.id
        EOS
        flat_point_hash = ActiveRecord::Base.connection.exec_query(flattened_sql)
      else
        flat_point_hash = nil
      end
    end

    #Remove all redundant keys and leave only top-level parent ID keys
    @flattened_data.each do |doc_key, doc|
      doc.each do |grp_id, grp_value|
        grp_value.each do |grp|
          doc.delete(grp[:id])
        end
      end
    end
  end

  #Turns populated @backbone_ids_set into two-direction navigable data tree
  #bb_data_hash is group data and anno data in row form
  def generate_backbone_structure()
    backbone_points_sql = <<-EOS
      SELECT g.id AS group_id, g.parent_id, g.document_id, g.name, a.title, a.content
      FROM (SELECT g1.id, g1.parent_id, g1.document_id, g1.name
        FROM groups g1 WHERE g1.id IN (#{@backbone_id_string})) g
      LEFT JOIN annotation_groups ag on g.id=ag.group_id AND ag.qa_approved_by IS NOT NULL
      LEFT JOIN annotations a ON ag.annotation_id=a.id
      ORDER BY g.document_id, g.id
    EOS
    bb_data_hash = ActiveRecord::Base.connection.exec_query(backbone_points_sql)

    bb_data_hash.each do |anno|
      @backbone_data[anno['document_id']] = {} if @backbone_data[anno['document_id']].nil?
      @backbone_data[anno['document_id']][anno['group_id']] = {annos: [], children: Set.new()} if @backbone_data[anno['document_id']][anno['group_id']].nil?
      @backbone_data[anno['document_id']][anno['parent_id']] = {annos: [], children: Set.new()} if @backbone_data[anno['document_id']][anno['parent_id']].nil?
      grp = @backbone_data[anno['document_id']][anno['group_id']]
      par = @backbone_data[anno['document_id']][anno['parent_id']]

      if grp[:name].nil?
        grp[:parent_id] = anno['parent_id']
        grp[:name] = anno['name']
      end

      grp[:annos] << { title: anno['title'], content: anno['content'] } if !anno['title'].nil?
      par[:children].add(anno['group_id'])
    end
  end


  #Turn a filter hash into a SQL string that can be used to filter annotations
  def generate_filter_string(filters)
    sql_string = ""
    filter_count = 0
    filters.each do |fnkey, filter|
      f_title = ActiveRecord::Base.connection.quote(fnkey)
      tbl_alt = "a#{filter_count}"
      sql_string << "INNER JOIN annotations #{tbl_alt} ON d1.id=#{tbl_alt}.document_id AND UPPER(#{tbl_alt}.title)=UPPER(#{f_title}) AND ("
      filt_val_count = 0
      filter.each do |fvkey, fvalue|
        f_value = ActiveRecord::Base.connection.quote(fvkey)
        sql_string << " OR " if filt_val_count > 0
        sql_string << "#{tbl_alt}.content ~* #{f_value}"
        filt_val_count += 1
      end
      sql_string << ")"
      filter_count += 1
    end

    return sql_string
  end

  #Get hash of endpoint groups from search parameters
  def get_endpoint_hash(endpoints, filters)
    endpoints.each_with_index do |endpoint, index|
      endpoints[index] = ActiveRecord::Base.connection.quote(endpoint)
    end
    sql_endpoint = "UPPER(#{endpoints.join('), UPPER(')})"
    sql_filters = generate_filter_string(filters)

    first_run_sql = <<-EOS
      SELECT g.id, g.parent_id, g.document_id
      FROM (SELECT DISTINCT(d1.id)
        FROM (
          SELECT id
          FROM documents
          WHERE status=8) d1 #{sql_filters}) d
      INNER JOIN groups g on d.id=g.document_id AND g.qa_approved_by IS NOT NULL AND UPPER(g.name) IN (#{sql_endpoint})
      WHERE EXISTS (SELECT id FROM annotation_groups where group_id=g.id AND qa_approved_by IS NOT NULL)
      ORDER BY g.document_id
    EOS
    endpoint_hashes = ActiveRecord::Base.connection.exec_query(first_run_sql).to_hash
    parent_ids = Set.new()
    endpoint_hashes.each_with_index do |grp, index|
      if( parent_ids.include?(grp['id']) )
        endpoint_hashes.slice!(index)
      else
        parent_ids.add(grp['parent_id'])
      end
    end
  end

  #Function that traverses tree and moves a group's annotations to its children if they share the same name
  def perform_backbone_merges()
    docs = Document.where({id: @backbone_ids_index.keys})
    docs.each do |doc|
      base = Group.base(doc)
      grp_ids = [base.id]
      doc_id = doc.id.to_s

      while grp_ids.length > 0
        all_children = []
        grp_ids.each do |grp_id|
          grp_match = false
          grp = @backbone_data[doc_id][grp_id.to_s]

          grp[:children].each do |child_id|
            child = @backbone_data[doc_id][child_id]
            if grp[:name] == child[:name]
              grp_match = true

              grp[:annos].each do |p_anno|
                anno_match = false

                child[:annos].each do |c_anno|
                  anno_match = true if p_anno[:title] == c_anno[:title]
                end

                child[:annos] << p_anno if !anno_match
              end
            end
          end

          grp[:annos] = [] if grp_match
          all_children.concat(grp[:children].to_a)
        end

        grp_ids = all_children
      end
    end
  end
end




###
# ExtractionTable: Data object for storing necessary column, row, and other data for efficiently turning extracted data into CSV table.
###
class ExtractionTable
  attr_reader :row_data     #Array of arrays of data values
  attr_reader :column_data  #Single array of column headers

  @groups_contained #Maps group name to an array of hashes containing its first and last index
  @current_row      #Index of current row
  @endpoint         #Endpoint column name
  @group_cache      #Cache group data by group ID, hash mapping group ID to starting row index and array of data

  def initialize()
    @groups_contained = {}
    @group_cache = {}
    @current_row = -1
    @row_data = []
    @column_data = []
  end


  #Inserts backbone and flattened data for a group into current row.
  #Grp_Id is the key to use when pushing/pulling from the cache
  def add_group_data(grp_id, bb_data, flat_data)
    if !@group_cache[grp_id].nil?
      cached_grp = @group_cache[grp_id]
      #If group is cached and non-empty, just insert it in the right place
      if cached_grp[:data].length > 0
        last = cached_grp[:start] + (cached_grp[:data].length - 1)
        @row_data[@current_row][cached_grp[:start]..last] = cached_grp[:data]
      end
    else
      #Otherwise, generate the data
      add_backbone_data(grp_id, bb_data)
      add_flattened_data(grp_id, bb_data, flat_data) if !flat_data.nil?
    end
  end

  #Flush the cache
  def clear_cache
    @group_cache = {}
  end

  #Set state to a brand new row
  def new_row
    @groups_contained.each do |grp_key, grp_mapping|
      grp_mapping.reset_current()
    end
    @current_row += 1
    @row_data << Array.new(@column_data.length)
  end


  private


  #Adds backbone data to row and cache
  def add_backbone_data(grp_id, bb_data)
    curr_row = @row_data[@current_row]

    contained_grp = increment_group_use(bb_data[:name])
    group_cols =  get_col_subset(contained_grp)
    numbered_name = contained_grp.get_numbered_group_name()
    indices = contained_grp.get_indices()

    bb_data[:annos].each do |point|
      col_name = numbered_name + '.' + point[:title]
      if group_cols.nil?
        rel_col_index = add_column(col_name, contained_grp, true)
        group_cols =  get_col_subset(contained_grp)
      else
        rel_col_index = group_cols.find_index(col_name)
        if rel_col_index.nil?
          rel_col_index = add_column(col_name, contained_grp, true)
          group_cols =  get_col_subset(contained_grp)
        end
      end
      curr_row[rel_col_index + indices[:first]] = point[:content]
    end

    @group_cache[grp_id] = {
      :start  => indices[:first],
      :data   => indices[:last].nil? ? [] : Array.wrap(curr_row[indices[:first]..indices[:last]])
    }
  end


  #Adds new column to a group and updates existing rows to contain it.  Returns relative index inside group
  #To_front: if set, appends to front, otherwise appends to end
  def add_column(col_name, contained_grp, to_front)
    contained_grp.add_colspace()
    indices = contained_grp.get_indices()

    #Update index refs for group uses other than this one
    @groups_contained.each do |grp_key, grp|
      grp.shift_indices_right_after(indices[:first], contained_grp.name)
    end

    to_front ? @column_data.insert(indices[:first], col_name) : @column_data.insert(indices[:last], col_name)

    #Update existing rows
    @row_data.each do |row|
      to_front ? row.insert(indices[:first], nil) : row.insert(indices[:last], nil)
    end

    #Update index refs/data for cached groups
    @group_cache.each do |grp_index, grp|
      grp[:start] += 1 if grp[:start] > indices[:first]
      if grp[:start] <= indices[:first] && grp[:start] + (grp[:data].length - 1) >= indices[:last]
        grp[:data].insert(indices[:first] - grp[:start], nil)
      end
    end

    return to_front ? 0 : indices[:last] - indices[:first]
  end


  #Adds flattened data to row and cache
  def add_flattened_data(grp_id, bb_data, flat_data)
    curr_row = @row_data[@current_row]

    bb_contained = @groups_contained[bb_data[:name]]
    bb_group_name = bb_contained.get_numbered_group_name()
    bb_indices = bb_contained.get_indices()

    flat_data.each do |flat_grp|
      if flat_grp[:annos].length > 0
        contained_grp = increment_group_use(flat_grp[:name], bb_group_name)
        group_cols =  get_col_subset(contained_grp)
        group_name = bb_group_name == 'Home' ? '' : bb_group_name + '.'
        group_name += contained_grp.get_numbered_group_name()
        indices = contained_grp.get_indices()

        flat_grp[:annos].each do |point|
          col_name = group_name + '.' + point[:title]
          if group_cols.nil?
            rel_col_index = add_column(col_name, contained_grp, false)
            group_cols =  get_col_subset(contained_grp)
          else
            rel_col_index = group_cols.find_index(col_name)
            if rel_col_index.nil?
              rel_col_index = add_column(col_name, contained_grp, false)
              group_cols =  get_col_subset(contained_grp)
            end
          end
          curr_row[rel_col_index + indices[:first]] = point[:content]
        end

        #Update backbone group's cached data
        inside_bb_first = indices[:first] - bb_indices[:first]
        inside_bb_last = indices[:last] - bb_indices[:first]
        @group_cache[grp_id][:data][inside_bb_first..inside_bb_last] = curr_row[indices[:first]..indices[:last]]
      end
    end
  end


  #Adds new group name to collections and returns the leftmost index of the used groups, for use in inserting the new group's data
  #Bb_grp_name is name of backbone group is this is a flattened group (optional)
  #Returns the group mapping object
  def increment_group_use(grp_name, bb_grp_name=nil)
    if bb_grp_name.nil?
      #If this is a backbone group..
      @groups_contained[grp_name] = TableGroupMapping.new(grp_name) if @groups_contained[grp_name].nil?
      contained_grp = @groups_contained[grp_name]
      contained_grp.current += 1

      if !contained_grp.current_init?
        #If this is the first time with this use #, calculate the leftmost spot to put it in
        leftmost = @column_data.length > 0 ? @column_data.length - 1 : 0
        @groups_contained.each do |grp_name, grp_mapping|
          if grp_mapping.current > 0 && contained_grp != grp_mapping
            first = grp_mapping.get_indices[:first]
            leftmost = first if first < leftmost
          end
        end
      end
    else
      #If this the flattened child of a backbone group..
      contained_bb = @groups_contained[bb_grp_name]
      contained_grp = contained_bb.get_child(grp_name).nil? ? contained_bb.add_child(grp_name) : contained_bb.get_child(grp_name)
      contained_grp.current += 1

      #If this is the first time with this use #, use parent's last spot as leftmost index
      if !contained_grp.current_init?
        last = contained_bb.get_indices[:last]
        last = last.nil? ? contained_bb.get_indices[:first] : last += 1
        leftmost = last
      end
    end

    #If 'left-most' ends up being the right-most in a non-empty set, add one to be after the end
    leftmost += 1 if @column_data.length > 0 && leftmost == (@column_data.length - 1)

    contained_grp.add_use(leftmost, nil) if !contained_grp.current_init?
    return contained_grp
  end


  #Get subset of columns that apply to the passed @groups_contained object
  def get_col_subset(contained_grp)
    indices = contained_grp.get_indices()
    last = indices[:last].nil? ? indices[:first] : indices[:last]
    return Array.wrap(@column_data[indices[:first]..last])
  end


  #Increment the used count of a group -- takes group name and parent backbone group name (optional).  Return new count
  def increment_used_count(group_name, bb_group_name=nil)
    bb_group_name.nil? ? @groups_used[group_name][:used] += 1 : @groups_used[bb_group_name][group_name][:used] += 1
  end
end




#####
# TableGroupMapping: Object used by ExtractionTable to abstract away the details of mapping a group name to a set of columns.
#         A mapping is used multiple different times ('uses'), with each use having its own indices and recursive children references.
#####
class TableGroupMapping
  attr_accessor :current  #Tracks which use you are on in the current row.. starts at 1, so it's 1 more than the array index
  attr_accessor :uses     #Array of 'first' and 'last' index hashes, with array index mapped to each use of group
  attr_reader   :name     #Group name

  @children #Array of Hashes mapping child group name to TableGroupMapping.  Array index matches 'uses' index
  @parent

  def initialize(group_name, parent_ref=nil)
    @uses = []
    @children = []
    @current = 0
    @name = group_name
    @parent = parent_ref
  end

  def add_child(group_name, use_index=@current)
    @children[use_index - 1][group_name] = TableGroupMapping.new(group_name, self)
  end

  #Expands a use's indices to cover a new column
  def add_colspace(use_index=@current)
    @uses[use_index - 1][:last] = @uses[use_index - 1][:last].nil? ? @uses[use_index - 1][:first] : @uses[use_index - 1][:last] + 1
    @parent.add_colspace() if !@parent.nil?
  end

  #Adds new use, indices are passed
  def add_use(first, last)
    @uses << {first: first, last: last}
    @children << {}
  end

  #Returns whether the data for the current use has been initialized (i.e. is this the first time through, or a return?)
  def current_init?
    @uses.length >= @current
  end

  #Generate what the table column header will be for passed-in field title (default to current)
  def get_numbered_group_name(use_index=@current)
    use_index > 1 ? @name + use_index.to_s : @name
  end

  def get_child(group_name, use_index=@current)
    @children[use_index - 1][group_name]
  end

  #Returns indices for a particular use (default to current)
  def get_indices(use_index=@current)
    @uses[use_index - 1]
  end

  def reset_current
    @current = 0
    @children.each do |child_ref|
      child_ref.values.each do |child|
        child.reset_current
      end
    end
  end

  #Update any index sets that come after passed-in index.
  # Option to take a group name in, and skip updating the current use of it.. i.e. 'Update all group uses except this one'
  def shift_indices_right_after(start_index, skip_current_name=nil)
    @uses.each_with_index do |index_hash, index|
      if index == (@current - 1)
        skip_match = skip_current_name == @name

        #If any children match skip_current_name, we want to apply skip to parent as well
        if !skip_match
          @children[index].values.each do |child|
            skip_match = true if child.name == skip_current_name
          end
        end
      end

      if !skip_match
        index_hash[:first] += 1 if index_hash[:first] >= start_index
        index_hash[:last] += 1 if !index_hash[:last].nil? && index_hash[:last] >= start_index
      end

      #Update child group mappings
      @children[index].values.each do |child|
        child.shift_indices_right_after(start_index, skip_current_name)
      end
    end
  end

end