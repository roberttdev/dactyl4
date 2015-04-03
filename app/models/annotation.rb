class Annotation < ActiveRecord::Base

  include DC::Store::DocumentResource
  include DC::DocumentStatus
  include DC::Access

  belongs_to :document
  belongs_to :account # NB: This account is not the owner of the document.
                      #     Rather, it is the author of the annotation.

  belongs_to :organization
  has_many :project_memberships, :through => :document

  has_many :annotation_groups, :dependent => :destroy
  has_many :groups, :through => :annotation_groups

  attr_accessor :author

  validates :title, :presence=>true

  before_validation :ensure_title

  after_create  :reset_public_note_count
  after_destroy :reset_public_note_count

  # Sanitizations:
  #text_attr :title
  #html_attr :content, :level=>:super_relaxed

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

  scope :owned_by, lambda { |account|
    where( :account_id => account.id )
  }

  scope :unrestricted, lambda{ where( :access => PUBLIC_LEVELS ) }

  #Gets annos flattened with anno-group and/or note info, flattened to a particular group
  scope :flattened_by_group, ->(group_id) {
    includes(:document, :annotation_groups => :annotation_note).where({
        'annotation_groups.group_id' => group_id
    })
  }

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
    data = {'id' => id, 'page' => page_number, 'title' => title, 'content' => content, 'access' => access_name.to_s }
    data['location'] = {'image' => location} if location
    data['image_url'] = document.page_image_url_template if opts[:include_image_url]
    data['published_url'] = document.published_url || document.document_viewer_url(:allow_ssl => true) if opts[:include_document_url]
    data['account_id'] = account_id

    #If requested, pass anno+group relationship info
    if !opts[:skip_groups]
      data['groups'] = annotation_groups.map {|ag| ag.approval_json(document.in_qa?)}
    end

    if author
      data.merge!({
        'author'              => author[:full_name],
        'owns_note'           => author[:owns_note],
        'author_organization' => author[:organization_name]
      })
    end
    data
  end

  def reset_public_note_count
    document.reset_public_note_count
  end

  #As_json view of annotation is used by DocumentCloud side (use canonical for Document-Viewer)
  #This view flattens an annotation with a specific AnnotationGroup relationship.  The query that uses this JSON format will need to isolate
  #a single AG reference for each annotation.
  def as_json(opts={})
    anno_group = annotation_groups[0]
    opts.merge({:skip_groups => true})

    canonical(opts).merge({
      'document_id'         => document_id,
      'account_id'          => account_id,
      'organization_id'     => organization_id,
      'annotation_group_id' => anno_group.id,
      'approved_count'      => anno_group.approved_count,
      'approved'            => anno_group.qa_approved_by ? true : false,
      'qa_reject_note'      => anno_group.association_cache.keys.include?(:annotation_note) ? anno_group.annotation_note.note : nil,
      'templated'           => templated
    })
  end


  private

  def ensure_title
    self.title = "Untitled Annotation" if title.blank?
  end

end
