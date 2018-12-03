class Annotation < ActiveRecord::Base

  include DC::Store::DocumentResource
  include DC::DocumentStatus
  include DC::Access

  has_one :qc_clone, :class_name => "Annotation", :foreign_key => 'based_on'

  belongs_to :group
  belongs_to :highlight
  belongs_to :document
  belongs_to :account # NB: This account is not the owner of the document.
                      #     Rather, it is the author of the annotation.

  belongs_to :organization
  has_many :project_memberships, :through => :document

  has_one :qc_clone, :class_name => "Annotation", :foreign_key => 'based_on'
  has_one :annotation_note

  attr_accessor :author

  validates :title, :presence=>true

  before_validation :ensure_title

  after_create  :reset_public_note_count
  after_destroy :reset_public_note_count

  before_destroy :clear_highlights

  scope :accessible, lambda { |doc_status, account|
    access = []

    case doc_status
      when STATUS_DE1, STATUS_DE2
        access << "annotations.account_id = #{account.id}"
      when STATUS_IN_QA
        access << "qc_approved IS TRUE"
    end

    where( "(#{access.join(' or ')})" ).readonly(false) if access.size > 0
  }

  #Gets annotations based on doc status rules.  De_num refers to which DE window in QC/Supp QC (1, nil, 2)
  scope :by_doc_status, -> (doc, de_num) {
    if doc.in_supp_qc?
      #The three Supp QC options
      if de_num == "1"
        return self.where("iteration <> #{doc.iteration}")
      elsif de_num == "2"
        return self.where("iteration = #{doc.iteration}")
      end
    end
  }

  scope :owned_by, lambda { |account|
    where( :account_id => account.id )
  }

  scope :unrestricted, lambda{ where( :access => PUBLIC_LEVELS ) }

  # Annotations are not indexed for the time being.

  # searchable do
  #   text :title, :boost => 2.0
  #   text :content
  #
  #   integer :document_id
  #   integer :account_id
  #   integer :organization_id
  #   integer :access
  #   time    :created_at
  # end

  def self.create(params)
    if params[:highlight_id].nil? && !params[:location].nil? then
      highlight = Highlight.create({
          :document_id => params[:document_id],
          :location => params[:location],
          :page_number => params[:page_number]
      })
      params[:highlight_id] = highlight.id
    end
    params = params.except(:location,:page_number)
    super(params)
  end

  def clear_highlights
    #If this is the last object attached to a highlight, delete it
    if self.highlight and self.highlight.annotations.length == 1 and self.highlight.graphs.length == 0 then
      self.highlight.destroy
    end
  end

  def self.counts_for_documents(account, docs)
    doc_ids = docs.map {|doc| doc.id }
    self.where({:document_id => doc_ids}).group('annotations.document_id').count
  end

  def self.populate_author_info(notes, current_account=nil)
    return if notes.empty?
    account_sql = <<-EOS
      SELECT DISTINCT accounts.id, accounts.first_name, accounts.last_name,
                      organizations.name as organization_name
      FROM accounts
      INNER JOIN annotations   ON annotations.account_id = accounts.id
      INNER JOIN organizations ON organizations.id = annotations.organization_id
      WHERE annotations.id in (#{notes.map(&:id).join(',')})
    EOS
    rows = Account.connection.select_all(account_sql)
    account_map = rows.inject({}) do |memo, acc|
      memo[acc['id'].to_i] = acc unless acc.nil?
      memo
    end
    notes.each do |note|
      author = account_map[note.account_id]
      note.author = {
        :full_name         => author ? "#{author['first_name']} #{author['last_name']}" : "Unattributed",
        :account_id        => note.account_id,
        :owns_note         => current_account && current_account.id == note.account_id,
        :organization_name => author['organization_name']
      }
    end
  end

  def self.public_note_counts_by_organization
    self.unrestricted
      .joins(:document)
      .where(["documents.access in (?)", PUBLIC_LEVELS])
      .group('annotations.organization_id')
      .count
  end

  def page
    document.pages.find_by_page_number(page_number)
  end

  def access_name
    ACCESS_NAMES[access]
  end

  def cacheable?
    PUBLIC_LEVELS.include?(access) && document.cacheable?
  end

  def canonical_url
    document.canonical_url(:html) + '#document/' + page_number.to_s
  end

  def canonical_cache_path
    "/documents/#{document.id}/annotations/#{id}.js"
  end

  #Canonical view of annotation is used by Document-Viewer side (use as_json for DocumentCloud)
  def canonical(opts={})
    data = {'id' => id, 'title' => title, 'content' => content, 'access' => access_name.to_s }
    data['account_id'] = account_id
    data['anno_type'] = 'annotation'
    data['approved'] = get_approval_status
    data['group_id'] = group_id
    data['is_graph_data'] = is_graph_data
    data['iteration'] = iteration
    data['match_id'] = match_id

    #If account ID passed in, determine whether it 'owns' this note currently (can edit, generally)
    data['owns_note'] = opts[:account] && (opts[:account].id == account_id) && (iteration == document.iteration)

    data
  end

  def reset_public_note_count
    document.reset_public_note_count
  end

  #As_json view of annotation is used by DocumentCloud side (use canonical for Document-Viewer)
  #This view flattens an annotation with a highlight relationship.  The query that uses this JSON format will need to isolate
  #a single AG reference for each annotation.
  def as_json(opts={})
    opts.merge({:skip_groups => true})

    canonical(opts).merge({
      'account_id'        => account_id,
      'approved'          => get_approval_status,
      'based_on'          => based_on,
      'document_id'       => document_id,
      'iteration'         => iteration,
      'group_id'          => group_id,
      'highlight_id'      => highlight_id,
      'is_graph_data'     => is_graph_data,
      'location'          => self.highlight ? self.highlight.location : nil,
      'match_id'          => match_id,
      'match_strength'    => match_strength,
      'organization_id'   => organization_id,
      'qa_reject_note'    => (!self.annotation_note.nil?) ? self.qa_reject_note : nil,
      'templated'         => templated
    })
  end


  def get_approval_status
      approved = false
      if document.in_qc?
          approved = qc_clone ? true : false
      elsif document.in_qa? || document.in_supp_de?
          approved = qa_approved_by ? true : false
      end
  end


  #Instead of deleting in supp DE, mark
  def mark_deleted_in_supp
    self.update({:deleted_in_supp => true})
  end


  #Take in addressing marker and qa rejection note and set proper status
  #Not addressed + No note = Not addressed by QA
  #Addressed + No note = Approved
  #Addressed + Note = Rejected
  def update_qa_status(addressed, note, account_id, doc_id)
    if addressed && !qa_approved_by
      #If approved and we haven't stored approved by, store it
      self.update_attributes({:qa_approved_by => account_id})
    elsif !addressed && qa_approved_by
      #If for some reason approval is revoked, remove id ref
      self.update_attributes({:qa_approved_by => nil})
    end

    #Add/update note if passed
    if note
      if !annotation_note.nil?
        #If exists and text has changed, update
        annotation_note.update_attributes({:note => note}) if annotation_note.note != note
      else
        #If not, add
        AnnotationNote.create({
                                  :document_id         => doc_id,
                                  :annotation_id        => self.id,
                                  :note                => note,
                                  :addressed           => false,
                                  :iteration           => self.iteration
                              })
      end
    else
      #If note exists, destroy it
      annotation_note.destroy if !annotation_note.nil?
    end

  end

  def qa_reject_note()
    return annotation_note.note if !annotation_note.nil?
    return supp_de_note.note if !supp_de_note.nil?
  end

  private

  def ensure_title
    self.title = "Untitled Annotation" if title.blank?
  end

end
