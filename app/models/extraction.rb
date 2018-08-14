#
# Extraction: Less a class representing an object, and more of a set of two processes (assemble_XX_from_query) for generating extraction.  Other methods are broken
#             out more or less to increase reading comprehension by separating these two processes into sub-task, because there's a lot of code here.
#
class Extraction
  require 'csv'
  require 'json'

  attr_reader :filename #Tracks file(s) containing output.  Is an array (when many mid-extraction), but a string by the end of extraction (when it is one)

  @backbone_ids_index   #Hash of sets mapping a document ID to the set of group IDs composing its backbone
  @backbone_id_string   #Comma separated string of all backbone group ids -- better for performance to run once and store class-wide
  @backbone_data        #Hash of backbone data: key is document ID then group ID, contains group-level data and array of annotation data
  @flattened_data       #Hash of flattened data: key is document ID then backbone parent group ID, contains
  @extract_doc_ids      #Tracks the doc ID's used in the extraction


  def initialize
    @filename = []
    @backbone_ids_index = {}
    @backbone_data = {}
    @flattened_data = {}
  end


  #Take in parameters and generate new extraction in JSON format
  #Endpoint: String representing annotation title
  #Filters: Hash consisting of annotation title(s) and value(s)
  #Account_id: account to provide access to the resulting annotations to
  #Repository_id: repository to limit results to
  def assemble_json_from_query( endpoints, filters, account_id, repository_id )
    grp_ids = ""
    return_hash = {}
    grp_id_ref = {}   #Maps grp IDs to correct hash during creation

    #Step 1: Generate a SQL statement that will return the ID's of documents that match parameters, and their base groups
    endpoints.each_with_index do |endpoint, index|
      endpoints[index] = ActiveRecord::Base.connection.quote(endpoint)
    end
    sql_endpoint = "UPPER(#{endpoints.join('), UPPER(')})"
    sql_filters = generate_filter_string(filters)
    repo_clause = repository_id.nil? ? " IS NULL" : "=#{repository_id}"

    init_sql = <<-EOS
      SELECT DISTINCT(d.id) AS document_id, bg.id AS base_id, bg.name
      FROM (
        SELECT DISTINCT(d1.id)
        FROM documents d1 #{sql_filters}
        WHERE status=8 AND repository_id#{repo_clause}) d
      INNER JOIN groups g on d.id=g.document_id AND g.qa_approved_by IS NOT NULL AND UPPER(g.name) IN (#{sql_endpoint})
      LEFT JOIN annotation_notes an on g.id=an.group_id
      INNER JOIN groups bg on d.id=bg.document_id AND bg.base=TRUE
      WHERE an.id IS NULL
    EOS
    init_hash = ActiveRecord::Base.connection.exec_query(init_sql)
    init_hash.each do |doc_and_base|
      grp_id_ref[doc_and_base['base_id']] = return_hash[doc_and_base['document_id']] = {
        name: doc_and_base['name'],
        data_points: [],
        children: []
      }
      grp_ids += doc_and_base['base_id'] + ','
    end
    grp_ids = grp_ids.chop

    #Step 2, grab annos from one horizontal slice of group trees, populate JSON, get children, repeat until finished
    loop do
      slice_sql = <<-EOS
        SELECT g.id AS group_id, g.name, a.title, a.content, a.id as anno_id
        FROM (SELECT g1.id, g1.name
        FROM groups g1 WHERE g1.id IN (#{grp_ids})) g
        LEFT JOIN (SELECT a.*
          FROM annotations a
          LEFT JOIN annotation_notes an on a.id=an.annotation_id AND a.qa_approved_by IS NOT NULL AND an.id IS NULL) a ON g.id=a.group_id
      EOS
      slice_hash = ActiveRecord::Base.connection.exec_query(slice_sql)

      slice_hash.each do |grp_and_anno|
        grp_id_ref[grp_and_anno['group_id']][:data_points] << { id: grp_and_anno['anno_id'], name: grp_and_anno['title'], value: grp_and_anno['content'] } if !grp_and_anno['title'].nil?
      end

      child_sql = <<-EOS
        SELECT g.id AS group_id, g.name, g.parent_id
        FROM groups g WHERE parent_id IN (#{grp_ids})
      EOS
      child_hash = ActiveRecord::Base.connection.exec_query(child_sql)

      grp_ids = ""
      child_hash.each do |child|
        p_children = grp_id_ref[child['parent_id']][:children]
        p_children << {
          name: child['name'],
          data_points: [],
          children: []
        }
        grp_id_ref[child['group_id']] = p_children[p_children.length - 1]
        grp_ids += child['group_id'] + ','
      end
      grp_ids = grp_ids.chop

      break if grp_ids == ""
    end

    #Turn hash into JSON, save to file
    time = Time.new()
    @filename << "/extraction/json/#{time.year}#{time.month}#{time.day}#{time.hour}#{time.min}#{time.sec}#{time.usec}.json"
    File.write("public#{@filename[0]}", return_hash.to_json)

    #If applicable, generate access data for VO user
    generate_vo_data(account_id, @backbone_ids_index.keys) if !account_id.nil?

    return @filename
  end


  #Take in parameters and generate new extraction in CSV format, returning filename
  #Endpoint: String representing annotation title
  #Filters: Hash consisting of annotation title(s) and value(s)
  #Account_id: account to provide access to the resulting annotations to
  #Repository_id: repository to limit results to
  def assemble_csv_from_query( endpoints, filters, account_id, repository_id )
    #Step 1: Collect all IDs of endpoint groups and backbone groups
    endpoint_hash = get_endpoint_hash(endpoints, filters, repository_id)
    extract_backbone_ids(endpoint_hash)

    #Step 2: Extract full group/data point info for all data in backbone groups
    generate_backbone_structure()

    #Step 3: Find base groups for all docs retrieved, and use them to start recursive merge process
    perform_backbone_merges()

    #Step 4: Extract flattened data for non-backbone groups
    extract_flattened_data()

    #Step 5: Build table structure from backbone and flattened data
    final_table = build_table(endpoint_hash, !account_id.nil?)

    #Step 6: Convert to Extraction CSV file(s)
    create_csv(final_table)

    #Step 7: If applicable, generate access data for VO user; otherwise set filename as first file in array
    !account_id.nil? ? generate_vo_data(account_id, @backbone_ids_index.keys) : @filename = @filename[0]

    return @filename
  end




  private

  #Builds the CSV table from the data populated in memory
  #Endpoint_hash contains a series of id, parent_id, and document_id fields, indicating a group, its parent, and its document.
  #Endpoint_hash SHOULD BE ORDERED BY DOCUMENT ID or memory-saving logic will hack the structure apart!
  #Track_ids determines whether IDs of annotations are tracked as well, to be passed back in a separate file
  def build_table(endpoint_hash, track_ids)
    final_table = ExtractionTable.new(track_ids)
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
        flat_data = @flattened_data.empty? ? nil : @flattened_data[endpoint['document_id']][grp_id]
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
    file_start = "/extraction/csv/#{time.year}#{time.month}#{time.day}#{time.hour}#{time.min}#{time.sec}#{time.usec}"
    CSV.open("public#{file_start}-data.csv", "w") do |csv|
      csv << table.column_data
      table.row_data.each do |row|
        csv << row
      end
    end
    @filename << "#{file_start}-data.csv"

    #If ID data was tracked, generate id CSV as well
    if table.id_data.length > 0
      CSV.open("public#{file_start}-ids.csv", "w") do |csv|
        csv << table.column_data
        table.id_data.each do |row|
          csv << row
        end
      end
      @filename << "#{file_start}-ids.csv"
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
        @backbone_ids_index[group['document_id']] = Set.new()
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
    ancestry_names = {}

    flattened_sql = <<-EOS
      SELECT g.id AS group_id, g.parent_id, g.document_id, g.name, a.title, a.content, a.id as anno_id
      FROM (SELECT g1.id, g1.parent_id, g1.document_id, g1.name
        FROM groups g1 WHERE g1.parent_id IN (#{@backbone_id_string}) AND g1.id NOT IN (#{@backbone_id_string})) g
      LEFT JOIN (SELECT a.*
        FROM annotations a
        LEFT JOIN annotation_notes an on a.id=an.annotation_id AND a.qa_approved_by IS NOT NULL AND an.id IS NULL) a ON g.id=a.group_id
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

          if ancestry_names[point['parent_id']].nil?
            ancestry_name = point['name']
          else
            if ancestry_names[point['parent_id']][:name] == point['name']
              ancestry_name = ancestry_names[point['parent_id']][:ancestry]
            else
              ancestry_name = ancestry_names[point['parent_id']][:ancestry] + '.' + point['name']
            end
          end
          ancestry_names[point['group_id']] = { ancestry: ancestry_name, name: point['name'] }

          @flattened_data[point['document_id']][point['group_id']] = @flattened_data[point['document_id']][point['parent_id']]
          @flattened_data[point['document_id']][point['group_id']] << {name: ancestry_names[point['group_id']][:ancestry], id: point['group_id'], annos: []}

          last_groupid = point['group_id']
          group_id_array << last_groupid
        end

        group_array = @flattened_data[point['document_id']][point['group_id']]
        group_array[group_array.length - 1][:annos] << {id: point['anno_id'], title: point['title'], content: point['content']} if !point['title'].nil?
      end

      if group_id_array.length > 0
        flattened_sql = <<-EOS
          SELECT g.id AS group_id, g.parent_id, g.document_id, g.name, a.title, a.content, a.id as anno_id
          FROM (SELECT g1.id, g1.parent_id, g1.document_id, g1.name
            FROM groups g1 WHERE g1.parent_id IN (#{group_id_array.join(',')})) g
          LEFT JOIN (SELECT ag.*
            FROM annotation_groups ag
            LEFT JOIN annotation_notes an on ag.id=an.annotation_group_id AND ag.qa_approved_by IS NOT NULL AND an.id IS NULL) ang ON g.id=ang.group_id
          LEFT JOIN annotations a ON ang.annotation_id=a.id
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
      SELECT g.id AS group_id, g.parent_id, g.document_id, g.name, a.title, a.content, a.id as anno_id
      FROM (SELECT g1.id, g1.parent_id, g1.document_id, g1.name
        FROM groups g1 WHERE g1.id IN (#{@backbone_id_string})) g
      LEFT JOIN (SELECT a.*
        FROM annotations a
        LEFT JOIN annotation_notes an on a.id=an.annotation_id AND a.qa_approved_by IS NOT NULL AND an.id IS NULL) a ON g.id=a.group_id
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

      grp[:annos] << { id: anno['anno_id'], title: anno['title'], content: anno['content'] } if !anno['title'].nil?
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


  #Assign a VO user access to documents from the extraction
  def generate_vo_data(account_id, doc_ids)
    ActiveRecord::Base.transaction do
      doc_ids.each do |doc_id|
        review_sql = <<-EOS
          INSERT INTO view_only_accesses (account_id, document_id, created_at, updated_at)
          VALUES (#{account_id}, #{doc_id}, current_date, current_date)
        EOS
        ActiveRecord::Base.connection.execute(review_sql)
      end
    end
  end


  #Get hash of endpoint groups from search parameters
  def get_endpoint_hash(endpoints, filters, repository_id)
    endpoints.each_with_index do |endpoint, index|
      endpoints[index] = ActiveRecord::Base.connection.quote(endpoint)
    end
    sql_endpoint = "UPPER(#{endpoints.join('), UPPER(')})"
    sql_filters = generate_filter_string(filters)

    repo_clause = repository_id.nil? ? " IS NULL" : "=#{repository_id}"

    first_run_sql = <<-EOS
      SELECT g.id, g.parent_id, g.document_id
      FROM (SELECT DISTINCT(d1.id)
        FROM (
          SELECT id
          FROM documents
          WHERE status=8 AND repository_id#{repo_clause}) d1 #{sql_filters}) d
      INNER JOIN groups g on d.id=g.document_id AND g.qa_approved_by IS NOT NULL AND UPPER(g.name) IN (#{sql_endpoint})
      WHERE EXISTS (SELECT a.id FROM annotations a
        LEFT JOIN annotation_notes an on a.id=an.annotation_id
        WHERE a.group_id=g.id AND qa_approved_by IS NOT NULL AND an.id IS NULL)
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
  attr_reader :id_data      #Complementary array of arrays of ids of points in table

  @groups_contained #Maps group name to an array of hashes containing its first and last index
  @current_row      #Index of current row
  @endpoint         #Endpoint column name
  @group_cache      #Cache group data by group ID, hash mapping group ID to starting row index and array of data
  @id_cache         #Cache anno ids for group cache points by group ID, hash mapping group ID to starting row index and array of data
  @store_ids        #Whether or not to store anno IDs in separate reference table

  def initialize(store_ids)
    @store_ids = store_ids
    @groups_contained = {}
    @group_cache = {}
    @id_cache = {}
    @current_row = -1
    @row_data = []
    @column_data = []
    @id_data = []
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
        @id_data[@current_row][cached_grp[:start]..last] = @id_cache[grp_id][:data] if @store_ids
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
    @id_data << Array.new(@column_data.length) if @store_ids
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
      @id_data[@current_row][rel_col_index + indices[:first]] = point[:id] if @store_ids
    end

    @group_cache[grp_id] = {
      :start  => indices[:first],
      :data   => indices[:last].nil? ? [] : Array.wrap(curr_row[indices[:first]..indices[:last]])
    }
    @id_cache[grp_id] = {
      :start  => indices[:first],
      :data   => indices[:last].nil? ? [] : Array.wrap(@id_data[@current_row][indices[:first]..indices[:last]])
    } if @store_ids
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
    @row_data.each_index do |row_index|
      if to_front
        @row_data[row_index].insert(indices[:first], nil)
        @id_data[row_index].insert(indices[:first], nil) if @store_ids
      else
        @row_data[row_index].insert(indices[:last], nil)
        @id_data[row_index].insert(indices[:last], nil) if @store_ids
      end
    end

    #Update index refs/data for cached groups
    @group_cache.each do |grp_index, grp|
      grp[:start] += 1 if grp[:start] > indices[:first]
      if grp[:start] <= indices[:first] && grp[:start] + (grp[:data].length - 1) >= indices[:last]
        grp[:data].insert(indices[:first] - grp[:start], nil)
        @id_cache[grp_index][:data].insert(indices[:first] - grp[:start], nil) if @store_ids
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
          @id_data[@current_row][rel_col_index + indices[:first]] = point[:id] if @store_ids
        end

        #Update backbone group's cached data
        inside_bb_first = indices[:first] - bb_indices[:first]
        inside_bb_last = indices[:last] - bb_indices[:first]
        @group_cache[grp_id][:data][inside_bb_first..inside_bb_last] = curr_row[indices[:first]..indices[:last]]
        @id_cache[grp_id][:data][inside_bb_first..inside_bb_last] = @id_data[@current_row][indices[:first]..indices[:last]] if @store_ids
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