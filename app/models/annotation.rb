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
  text_attr :title
  html_attr :content, :level=>:super_relaxed

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

  def canonical(opts={})
    data = {'id' => id, 'page' => page_number, 'title' => title, 'content' => content, 'access' => access_name.to_s }
    data['location'] = {'image' => location} if location
    data['image_url'] = document.page_image_url_template if opts[:include_image_url]
    data['published_url'] = document.published_url || document.document_viewer_url(:allow_ssl => true) if opts[:include_document_url]
    data['account_id'] = account_id
    data['approved'] = qc_approved if document.in_qc?
    data['approved'] = qa_approved if document.in_qa?
    data['groups'] = status_filtered_groups

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

  def as_json(opts={})
    canonical.merge({
      'document_id'     => document_id,
      'account_id'      => account_id,
      'organization_id' => organization_id
    })
  end

  #Return groups this annotation belongs to, filtered based on rules related to doc status.  Returns groups used by viewer for each status.
  def status_filtered_groups
    whereClause = {"groups.account_id" => account_id} if document.in_de?
    whereClause = {"groups.account_id" => [document.de_one_id, document.de_two_id]} if document.in_qc?
    whereClause = {"groups.account_id" => document.qc_id} if document.in_qa?

    annotation_groups.includes(:group).where(whereClause).pluck(:group_id)
  end

  private

  def ensure_title
    self.title = "Untitled Annotation" if title.blank?
  end

end
