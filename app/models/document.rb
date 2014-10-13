# -*- coding: utf-8 -*-
class Document < ActiveRecord::Base
  include DC::Access
  include DC::DocumentStatus
  include ActionView::Helpers::TextHelper

  # Accessors and constants:

  attr_accessor :mentions, :total_mentions, :annotation_count, :hits
  attr_writer   :organization_name, :organization_slug, :display_language, :account_name, :account_slug

  DEFAULT_TITLE = "Untitled Document"

  MINIMUM_POPULAR = 100

  CONCURRENT_UPLOAD_LIMIT = 10

  DISPLAY_DATE_FORMAT     = "%b %d, %Y"
  DISPLAY_DATETIME_FORMAT = "%I:%M %p – %a %b %d, %Y"

  DEFAULT_CANONICAL_OPTIONS = {
    :sections => true, :annotations => true, :contributor => true
  }

  DEFAULT_IMPORT_OPTIONS = {
    :access => nil, :text_only => false, :email_me => false, :force_ocr => false, :secure => false
  }

  # If the Document.pending count is greater than this number, send a warning.
  WARN_QUEUE_LENGTH = 150

  # DB Associations:

  belongs_to :account
  belongs_to :organization

  has_one :document_status
  has_one  :docdata,              :dependent   => :destroy, :inverse_of=>:document
  has_many :pages,                :dependent   => :destroy, :inverse_of=>:document
  has_many :entities,             :dependent   => :destroy, :inverse_of=>:document
  has_many :entity_dates,         :dependent   => :destroy
  has_many :sections,             :dependent   => :destroy
  has_many :groups,               :dependent   => :destroy
  has_many :annotations,          :dependent   => :destroy
  has_many :remote_urls,          :dependent   => :destroy
  has_many :project_memberships,  :dependent   => :destroy
  has_many :projects,             :through     => :project_memberships
  has_many :annotation_notes,     :dependent   => :destroy
  has_many :reviews,              :dependent   => :destroy


  has_many :reviewer_projects,     -> { where( :hidden => true) },
                                     :through     => :project_memberships,
                                     :source      => :project

  has_many :duplicates, ->(document) {
    where(["access in (?) and id != #{document.id} and text_changed = false", ACCESS_SUCCEEDED ])
  }, :foreign_key=>'file_hash', :primary_key=>'file_hash', :class_name=>"Document"

  validates :organization_id, :account_id, :access, :page_count, :title, :slug, :presence=>true

  validates :language, :inclusion => { :in => DC::Language::SUPPORTED }

  before_validation :ensure_titled, :on=>:create
  before_validation :ensure_language_is_valid

  after_destroy :delete_assets

  # Sanitizations (title handled separately):
  text_attr :source, :related_article, :remote_url
  styleable_attr :description

  delegate :slug, :to => :organization, :allow_nil => true, :prefix => true
  delegate :slug, :to => :account,      :allow_nil => true, :prefix => true

  # Scopes:

  scope :chronological, -> { order('created_at desc') }

  # NB: This is *not* efficient.
  scope :random,        -> { order('random()') }

  scope :owned_by, ->(account) { where( :account_id => account.id ) }

  scope :published,     ->{  where( 'remote_url is not null or detected_remote_url is not null' ) }
  scope :unpublished,   ->{  where( 'remote_url is null and detected_remote_url is null' ) }

  scope :pending,       ->{ where( :access => PENDING ) }
  scope :failed,        ->{ where( :access => ERROR   ) }
  scope :unrestricted,  ->{ where( :access => PUBLIC_LEVELS ) }
  scope :restricted,    ->{ where( :access => [PRIVATE, ORGANIZATION] ) }
  scope :finished,      ->{ where( :access => [PUBLIC, PRIVATE, ORGANIZATION, PREMODERATED, POSTMODERATED] ) }

  scope :popular,       ->{ where( ["hit_count > ?", MINIMUM_POPULAR] ) }

  scope :due,           ->( time=Time.now.utc ) { where( ["publish_at <= ?", time  ] ) }

  scope :since,         ->(time){ where( ["created_at >= ?", time] ) if time }


  # Restrict accessible documents for a given account/organization.
  # Either the document itself is public, or it belongs to us, or it belongs to
  # our organization and we're allowed to see it, or it belongs to a project
  # that's been shared with us.
  scope :accessible, lambda {|account, org|
    access = []

    #Base is complex: first, provide access for all 'ready for' statuses that user's role can see.. and add special exception if user has completed work as DE One
    deFmt = "((documents.status in (%{statuses}) AND NOT (documents.de_one_id=#{account.id} AND documents.de_one_complete IS true))"
    #Add logic for allowing access to DE2/Supp DE statuses if user is one of the DE users unless user has already completed DE work
    deFmt << " OR ((documents.status=#{STATUS_DE2} OR documents.status=#{STATUS_IN_SUPP_DE}) AND ((documents.de_one_id=#{account.id} AND documents.de_one_complete is not true) OR (documents.de_two_id=#{account.id} AND documents.de_two_complete is not true))))"

    qcFmt = "(documents.qc_id=#{account.id} AND documents.status=#{STATUS_IN_QC})"
    qaFmt = "(documents.qa_id=#{account.id} AND documents.status=#{STATUS_IN_QA})"

    if account.data_entry?
      access << deFmt % {statuses: DE_ACCESS.join(",")}
    end
    if account.quality_control?
      access << deFmt % {statuses: QC_ACCESS.join(",")}
      access << qcFmt
    end
    if account.quality_assurance?
      access << deFmt % {statuses: QA_ACCESS.join(",")}
      access << qcFmt
      access << qaFmt
    end
    access << "(documents.status in (#{EXTRACT_ACCESS.join(",")}))" if account.data_extraction?
    query = where( access.join(' or ') )
    query.readonly(false)
  }
  
  # The definition of the Solr search index. Via sunspot-rails.
  searchable do

    # Full Text...
    text :title, :default_boost => 2.0
    text :source
    text :description
    text :full_text do
      self.combined_page_text.gsub( Page::INVALID_SOLR_CHARACTERS, '' )
    end

    # Attributes...
    string  :title
    string  :source
    string  :language
    time    :created_at
    boolean :published, :using => :published?
    integer :id
    integer :account_id
    integer :organization_id
    integer :access
    integer :page_count
    integer :hit_count
    integer :public_note_count
    integer :status
    integer :de_one_id
    integer :de_two_id
    boolean :de_one_complete
    boolean :de_two_complete
    integer :qc_id
    integer :qa_id
    integer :project_ids, :multiple => true do
      self.project_memberships.map {|m| m.project_id }
    end

    # Entities...
    # DC::ENTITY_KINDS.each do |entity|
    #   text(entity) { self.entity_values(entity) }
    #   string(entity, :multiple => true) { self.entity_values(entity) }
    # end

    # Data...
    dynamic_string :data do
      self.docdata ? self.docdata.data.symbolize_keys : {}
    end

  end

  # Main document search method -- handles queries.
  def self.search(query, options={})
    query = DC::Search::Parser.new.parse(query) if query.is_a? String
    query.run(options)
  end

  # Upload a new document, starting the import process.
  def self.upload(params, account, organization)
    name     = params[:url] || params[:file].original_filename
    title    = params[:title] || File.basename(name, File.extname(name)).titleize
    access   = params[:make_public] ? PUBLIC :
               (params[:access] ? ACCESS_MAP[params[:access].to_sym] : PRIVATE)
    email_me = params[:email_me] ? params[:email_me].to_i : false
    file_ext = File.extname(name).downcase[1..-1]

    doc = self.create!(
      :organization_id    => organization.id,
      :account_id         => account.id,
      :access             => PENDING,
      :page_count         => 0,
      :title              => title,
      :study              => params[:study],
      :description        => params[:description],
      :source             => params[:source],
      :related_article    => params[:related_article],
      :remote_url         => params[:published_url] || params[:remote_url],
      :language           => params[:language] || account.language,
      :original_extension => file_ext,
      :iteration          => 1,
      :status             => STATUS_NEW
    )
    import_options = {
      :access => access,
      :email_me => email_me,
      :secure => params[:secure],
      :organization_id => organization.id,
      :account_id => account.id
    }
    if params[:url]
      import_options.merge!(:url => params[:url])
    else
      DC::Store::AssetStore.new.save_original(doc, params[:file].path, access)
    end
    doc.queue_import(import_options)
    if params[:project]
      project = Project.accessible(account).find_by_id(params[:project].to_i)
      project.add_document(doc) if project
    end
    if params[:data]
      doc.data = params[:data]
    end
    doc.reload
  end

  # Insert all documents that have been previously saved into the document's
  # `/inserts` folder in the asset store.
  def insert_documents(insert_page_at, document_count, eventual_access=nil)
    eventual_access ||= self.access || PRIVATE
    self.update_attributes :access => PENDING
    record_job(RestClient.post(DC::CONFIG['cloud_crowd_server'] + '/jobs', {:job => {
      'action'  => 'document_insert_pages',
      'inputs'  => [id],
      'options' => {
        :id              => id,
        :insert_page_at  => insert_page_at,
        :pdfs_count      => document_count,
        :access          => eventual_access
      }
    }.to_json}).body)
  end

  # Publish all documents with a `publish_at` timestamp that is past due.
  def self.publish_due_documents
    Document.restricted.due.find_each {|doc| doc.set_access PUBLIC }
  end

  # Populate the annotation counts for a list of documents with a single SQL.
  def self.populate_annotation_counts(account, docs)
    counts = Annotation.counts_for_documents(account, docs)
    docs.each {|doc| doc.annotation_count = counts[doc.id] }
  end

  # Ensure that titles are stripped of trailing whitespace.
  def title=(title="Untitled Document")
    self[:title] = self.strip title.strip
  end

  # Save all text assets, including the `combined_page_text`, and the text of
  # each page individually, to the asset store.
  def upload_text_assets(pages, access)
    asset_store.save_full_text(self, access)
    pages.each do |page|
      asset_store.save_page_text(self, page.page_number, page.text, access)
    end
  end

  # Update a document, with S3 permission fixing, cache expiry, and access control.
  def secure_update(attrs, account)
    if !account.allowed_to_edit?(self)
      self.errors.add(:base, "You don't have permission to update the document." )
      return false
    end
    access = attrs.delete :access
    access &&= access.to_i
    published_url = attrs.delete :published_url
    attrs[:remote_url] ||= published_url
    data = attrs.delete :data
    update_attributes attrs
    self.data = data if data
    set_access(access) if access && self.access != access
    true
  end

  # For polymorphism on access control with Note and Section:
  def document_id
    id
  end

  # Produce the full text of the document by combining the text of each of
  # the pages. Used at initial import.
  def combined_page_text
    self.pages.order('page_number asc').pluck(:text).join('')
  end

  # Determine the number of annotations on each page of this document.
  def per_page_annotation_counts
    self.annotations.group('page_number').count
  end

  def ordered_sections
    sections.order('page_number asc')
  end

  def ordered_annotations(account)
    whereClause = {"annotation_groups.created_by" => account.id} if in_de?
    whereClause = {"annotation_groups.created_by" => [de_one_id, de_two_id]} if in_qc?
    whereClause = {"annotation_groups.created_by" => qc_id} if in_qa?

    self.annotations.includes(:annotation_groups).where(whereClause).order('page_number asc, location asc nulls first')
  end

  def annotations_with_authors(account, annotations=nil)
    annotations ||= ordered_annotations(account)
    Annotation.populate_author_info(annotations, account)
    annotations
  end

  # Return an array of all of the document entity values for a given type,
  # for Solr indexing purposes.
  def entity_values(kind)
    self.entities.kind(kind.to_s).pluck('value')
  end

  # Reset the cached counter of public notes on the document.
  def reset_public_note_count
    count = annotations.unrestricted.count
    if count != self.public_note_count
      update_attributes :public_note_count => count
    end
  end

  # Return a hash of all the document's entities (for an API response).
  # The hash is ordered by entity kind, after the sidebar, with individual
  # entities sorted by relevance.
  def ordered_entity_hash
    hash = ActiveSupport::OrderedHash.new
    DC::VALID_KINDS.each {|kind| hash[kind] = [] }
    entities.each do |e|
      hash[e.kind].push :value => e.value, :relevance => e.relevance
    end
    hash.each do |key, list|
      hash[key] = list.sort_by {|e| -e[:relevance] }
    end
    hash
  end

  # updates the document's character count by detecting the
  # largest end_offset off our pages.
  def reset_char_count!
    update_attributes :char_count => 1+self.pages.maximum(:end_offset).to_i
  end

  # Does this document have a title?
  def titled?
    title.present? && (title != DEFAULT_TITLE)
  end

  def public?
    self.access == PUBLIC
  end

  def publicly_accessible?
    [PUBLIC, EXCLUSIVE, PREMODERATED, POSTMODERATED].include? access
  end
  alias_method :cacheable?, :publicly_accessible?

  def published?
    publicly_accessible? && (remote_url.present? || detected_remote_url.present?)
  end

  def published_url
    remote_url || detected_remote_url
  end

  def commentable?(account)
    [ PREMODERATED, POSTMODERATED ].include?(access) or ( account && account.allowed_to_comment?(self) )
  end

  # When the access level changes, all sub-resource and asset permissions
  # need to be updated.
  def set_access(access_level)
    changes = {:access => PENDING}
    changes[:publish_at] = nil if PUBLIC_LEVELS.include? access_level
    update_attributes changes
    background_update_asset_access access_level
  end

  # If we need to change the ownership of the document, we have to propagate
  # the change to all associated models.
  def set_owner(account)
    unless org = account.organization
      errors.add(:account, "must have an organization") and return false
    end
    update_attributes(:account_id => account.id, :organization_id => org.id)
    sql = "account_id = #{account.id}, organization_id = #{org.id}"
    self.pages.update_all( sql )
    self.entities.update_all( sql )
    self.entity_dates.update_all( sql )
  end

  def organization_name
    @organization_name ||= organization.name
  end

  def display_language
    @display_language ||= organization.language
  end

  def account_name
    @account_name ||= (account ? account.full_name : 'Unattributed')
  end

  def data
    docdata ? docdata.data : {}
  end

  def data=(hash)
    if hash.blank?
      self.docdata.destroy if self.docdata
      return
    end
    self.build_docdata unless self.docdata
    self.docdata.update_attributes :data => hash
  end

  # Ex: docs/1011
  def path
    File.join('documents', id.to_s)
  end

  def original_file_path
    File.join(path, slug + ".#{original_extension}")
  end

  # Ex: docs/1011/sec-madoff-investigation.txt
  def full_text_path
    File.join(path, slug + '.txt')
  end

  # Ex: docs/1011/sec-madoff-investigation.pdf
  def pdf_path
    File.join(path, slug + '.pdf')
  end

  # Ex: docs/1011/sec-madoff-investigation.rdf
  def rdf_path
    File.join(path, slug + '.rdf')
  end

  # Ex: docs/1011/pages
  def pages_path
    File.join(path, 'pages')
  end

  def annotations_path
    File.join(path, 'annotations')
  end

  def canonical_id
    "#{id}-#{slug}"
  end

  def canonical_path(format = :json)
    "documents/#{canonical_id}.#{format}"
  end

  def canonical_cache_path
    "/#{canonical_path(:js)}"
  end

  def project_ids
    self.project_memberships.map {|m| m.project_id }
  end

  # Externally used image path, not to be confused with `page_image_path()`
  def page_image_template
    "#{slug}-p{page}-{size}.gif"
  end

  def page_text_template
    "#{slug}-p{page}.txt"
  end

  def public_pdf_url
    File.join(DC::Store::AssetStore.web_root, pdf_path)
  end

  def private_pdf_url
    File.join(DC.server_root, pdf_path)
  end

  def pdf_url(direct=false)
    return public_pdf_url  if public? || Rails.env.development?
    return private_pdf_url unless direct
    DC::Store::AssetStore.new.authorized_url(pdf_path)
  end

  def thumbnail_url( options={} )
    page_image_url( 1, 'thumbnail', options )
  end

  def page_image_url(page, size, options={} )
    path = page_image_path(page, size)
    if public?
      url = File.join( DC::Store::AssetStore.web_root, path )
      url << "?#{updated_at.to_i}" if options[:cache_busting]
      url
    else
      DC::Store::AssetStore.new.authorized_url path
    end
  end

  def public_full_text_url
    File.join(DC::Store::AssetStore.web_root, full_text_path)
  end

  def private_full_text_url
    File.join(DC.server_root, full_text_path)
  end

  def full_text_url(direct=false)
    return public_full_text_url if public? || Rails.env.development?
    return private_full_text_url unless direct
    DC::Store::AssetStore.new.authorized_url(full_text_path)
  end

  def public_original_url
    File.join(DC::Store::AssetStore.web_root, original_file_path)
  end

  def private_original_url
    File.join(DC.server_root, original_file_path)
  end

  def original_url(direct=false)
    return public_original_url if public? || Rails.env.development?
    return private_original_url unless direct
    DC::Store::AssetStore.new.authorized_url(original_file_path)
  end

  def document_viewer_url(opts={})
    suffix = ''
    suffix = "#document/p#{opts[:page]}" if opts[:page]
    if ent = opts[:entity]
      page  = self.pages.where({:page_number => opts[:page]}).first
      occur = ent.split_occurrences.detect {|o| o.offset == opts[:offset].to_i }
      suffix = "#entity/p#{page.page_number}/#{URI.escape(ent.value)}/#{occur.page_offset}:#{occur.length}"
    end
    if date = opts[:date]
      occur = date.split_occurrences.first
      suffix = "#entity/p#{occur.page.page_number}/#{URI.escape(date.date.to_s)}/#{occur.page_offset}:#{occur.length}" if occur.page
    end
    canonical_url(:html, opts[:allow_ssl]) + suffix
  end

  def canonical_url(format = :json, allow_ssl = false)
    File.join(DC.server_root(:ssl => allow_ssl, :agnostic => format == :js), canonical_path(format))
  end

  def search_url
    "#{DC.server_root}/documents/#{id}/search.json?q={query}"
  end

  def translations_url
    "#{DC.server_root}/translations/{realm}/{language}"
  end

  def annotations_url
    File.join(DC.server_root(:force_ssl => true, :agnostic => false ), annotations_path )
  end

  def print_annotations_url
    "#{DC.server_root}/notes/print?docs[]=#{id}"
  end

  # Internally used image path, not to be confused with page_image_template()
  def page_image_path(page_number, size)
    File.join(pages_path, "#{slug}-p#{page_number}-#{size}.gif")
  end

  def page_text_path(page_number)
    File.join(pages_path, "#{slug}-p#{page_number}.txt")
  end

  def public_page_image_template
    File.join(DC::Store::AssetStore.web_root, File.join(pages_path, page_image_template))
  end

  def private_page_image_template
    File.join(DC.server_root, File.join(pages_path, page_image_template))
  end

  def page_image_url_template(opts={})
    tmpl = if opts[:local]
             File.join(slug, page_image_template )
           elsif self.public? || Rails.env.development?
             public_page_image_template
           else
             private_page_image_template
           end
    tmpl << "?#{updated_at.to_i}" if opts[:cache_busting]
    tmpl
  end

  def page_text_url_template(opts={})
    return File.join(slug, page_text_template) if opts[:local]
    File.join(DC.server_root, File.join(pages_path, page_text_template))
  end

  def reviewers
    return [] unless reviewer_projects.empty?
    reviewer_projects.map{ |project| project.collaborators }.flatten.uniq
  end

  def add_reviewer(account, creator)
    unless project = reviewer_projects.first
      project = Project.create :hidden => true
      project.set_documents([id])
    end
    project.add_collaborator account, creator
  end

  def remove_reviewer(account)
    reviewer_projects.first.remove_collaborator(account)
  end

  def reviewer_inviter(reviewer_account)
    return false if reviewer_projects.empty?
    collab = Collaboration.where(
      "account_id = ? AND project_id = ? AND creator_id IS NOT NULL",
      reviewer_account.id,
      reviewer_projects.first.id
    ).first
    collab && collab.creator
  end

  def low_priority?
    large  = self.file_size > 1.megabyte
    greedy = Document.owned_by(account).pending.count >= CONCURRENT_UPLOAD_LIMIT
    large || greedy
  end

  #Returns whether passed account has one of the current (incomplete) claims on the file
  def has_open_claim?(account)
    if account
      if self.status == STATUS_DE1 || self.status == STATUS_DE2 || self.status == STATUS_IN_SUPP_DE
        return true if (self.de_one_id == account.id && !self.de_one_complete) || (self.de_two_id == account.id && !self.de_two_complete)
      end

      return true if (self.status == STATUS_IN_QC || self.status == STATUS_IN_SUPP_QC) && self.qc_id == account.id
      return true if (self.status == STATUS_IN_QA || self.status == STATUS_IN_SUPP_QA) && self.qa_id == account.id
    end

    false
  end

  #Returned whether passed account has a completed claim on the file
  def has_completed_claim?(account)
    return true if (self.de_one_id == account.id && self.de_one_complete) || (self.de_two_id == account.id && self.de_two_complete)
    return true if self.status > STATUS_IN_QC && self.qc_id == account.id
    return true if self.status > STATUS_IN_QA && self.qa_id == account.id

    false
  end

  #Drops current claim for attached user and removes their current data
  def drop_claim(account)
    case self.status
      when STATUS_DE1, STATUS_DE2
        Annotation.destroy_all({document_id: self.id, account_id: account.id})
        Group.destroy_all({document_id: self.id, account_id: account.id})
        newStatus = self.status == STATUS_DE2 ? STATUS_DE1 : STATUS_NEW
        if self.de_one_id == account.id
          self.update({status: newStatus, de_one_id: self.de_two_id, de_two_id: nil, de_one_complete: self.de_two_complete, de_two_complete: nil})
        else
          self.update({status: newStatus, de_two_id: nil})
        end
      when STATUS_IN_QC
        Group.destroy_all({document_id: self.id, account_id: account.id})
        self.update({status: STATUS_READY_QC, qc_id: nil})
        AnnotationGroup.joins(:group).where({"groups.document_id" => self.id}).update_all({approved_count: 0})
      when STATUS_IN_QA
        annotation_notes.destroy_all
        AnnotationGroup.joins(:group).where({"groups.document_id" => self.id}).update_all({qa_approved_by: nil})
        self.update({status: STATUS_READY_QA, qa_id: nil, qa_note: nil})
    end
  end

  #Checks to see if current user's work can be marked as completed; is so, does it, if not, returns first field needing
  #to be addressed
  def mark_complete(params)
    history_status = 0

    case self.status
      when STATUS_DE1, STATUS_DE2
        error = mark_de_complete(params[:account])
      when STATUS_IN_QC
        error = mark_qc_complete
      when STATUS_IN_QA
        error = mark_qa_complete(params[:account], params[:self_assign])
    end

    return error if error

    #Add history event
    history_status = self.status if history_status == 0
    FileStatusHistory.create({
        :user => account.id,
        :status => history_status
    })

    return nil
  end


  #Mark DE work as complete
  def mark_de_complete(account)
    #Check that there are any annotations for this user
    annoCount = Annotation.where("document_id=#{self.id} AND account_id=#{account.id}").count
    if annoCount == 0
      return {
          'errorText' => 'Completion failed because no data points have been saved.  Please save a data point before marking complete.',
          'data' => {}
      }
    end

    anno = Annotation.where("document_id=#{self.id} AND account_id=#{account.id} AND (title IS NULL OR title='' OR content IS NULL OR content='')").take
    if anno
      return {
          'errorText' => 'Completion failed because a data point is incomplete.  Please populate or delete the incomplete point.',
          'data' => {id: anno.id, group_id: anno.annotation_groups[0].group_id}
      }
    else
      updateFields = {}
      if self.de_one_id==account.id
        updateFields[:de_one_complete] = true
        history_status = STATUS_DE1
      end
      if self.de_two_id==account.id
        updateFields[:de_two_complete] = true
        history_status = STATUS_DE2
      end
      updateFields[:status] = STATUS_READY_QC if (self.de_one_id==account.id && self.de_two_complete) || (self.de_two_id==account.id && self.de_one_complete)
      self.update updateFields
    end

    return nil
  end


  #Mark QC work as complete
  def mark_qc_complete
    self.update_attributes({:status => STATUS_READY_QA})

    return nil
  end


  #Mark QA work as complete
  def mark_qa_complete(account, self_assigned)
    #Check that all annotation groups have been addressed
    ag = AnnotationGroup.joins(:group).where({"groups.document_id" => self.id, :created_by => self.qc_id, "qa_approved_by" => nil}).take
    if ag
      return {
          'errorText' => 'Completion failed because a data point has not been addressed.  Please address all points.',
          'data' => {id: ag.annotation_id, group_id: ag.group_id}
      }
    end

    #If document contains rejections..
    if (!self.qa_note.nil? && self.qa_note != '') || self.annotation_notes
      if self_assigned.nil?
        #And no self assign preference is sent, error
        return { 'errorText' => 'no_self_assigned' }
      else
        #Otherwise, update and re-claim if requested
        self.update({
            status: STATUS_READY_SUPP_DE,
            de_one_id: nil,
            de_two_id: nil,
            qa_id: nil,
            de_one_complete: nil,
            de_two_complete: nil
        })
      end

      self.claim(account) if self_assigned
    else
      #If no rejections, complete
      self.update({status: STATUS_READY_EXT})
    end

    return nil
  end


  #Cancel QC and reject one or more DE's work; return status to DE
  def reject_de(account_id, de_num)
    #Check that user is QC or QA, and therefore has permission
    if( account_id == qc_id || account_id == qa_id )
      #Generate values for actions (anno/group delete step, doc status update step)
      delWhere = {document_id: id, account_id: [qc_id]}
      upValues = {qc_id: nil, de_two_id: nil, de_two_complete: nil}
      case de_num
        when "1"
          delWhere[:account_id] << de_one_id
          upValues[:de_one_id] = de_two_id
          upValues[:status] = STATUS_DE1
        when "2"
          delWhere[:account_id] << de_two_id
          upValues[:status] = STATUS_DE1
        when "3"
          delWhere[:account_id] << de_one_id << de_two_id
          upValues[:de_one_id] = nil
          upValues[:status] = STATUS_NEW
          upValues[:de_one_complete] = nil
      end

      Annotation.destroy_all(delWhere)
      Group.destroy_all(delWhere)
      self.update_attributes(upValues)
      annotations.update_all({qc_approved: false})
    else
      return false
    end
  end


  #Returns whether the doc is currently fully claimed
  def claimable?
    CLAIMABLE_STATUS.include?(self.status)
  end

  #Insert claim for doc from account
  def claim(account)
    case self.status
      when STATUS_NEW
        self.update({status: STATUS_DE1, de_one_id: account.id})
      when STATUS_DE1
        self.update({status: STATUS_DE2, de_two_id: account.id})
      when STATUS_READY_QC
        self.update({status: STATUS_IN_QC, qc_id: account.id})
      when STATUS_READY_QA
        self.update({status: STATUS_IN_QA, qa_id: account.id})
      when STATUS_READY_SUPP_DE
        self.update({status: STATUS_IN_SUPP_DE, de_one_id: account.id})
    end

    #Create a base group for the user in group-creating statuses
    if( self.status <= STATUS_IN_QC )
      Group.create({
          :name => 'Home',
          :parent_id => nil,
          :document_id => self.id,
          :account_id => account.id,
          :base => true,
          :iteration => self.iteration
      })
    end
  end

  def asset_store
    @asset_store ||= DC::Store::AssetStore.new
  end

  def delete_assets
    asset_store.destroy(self)
  end

  def reprocess_text(force_ocr = false)
    queue_import :text_only => true, :force_ocr => force_ocr, :secure => !calais_id
  end

  def reprocess_images
    queue_import :images_only => true, :secure => !calais_id
  end

  def reindex_all!(access=nil)
    Page.refresh_page_map(self)
    EntityDate.reset(self)
    pages = self.reload.pages
    Sunspot.index pages
    Sunspot.commit
    reprocess_entities if calais_id
    upload_text_assets(pages, access)
    self.access = access if access
    self.save!
  end

  def reprocess_entities
    RestClient.post(DC::CONFIG['cloud_crowd_server'] + '/jobs', {:job => {
      'action'  => 'reprocess_entities',
      'inputs'  => [id]
    }.to_json})
  end

  # Keep a local ProcessingJob record of this active CloudCrowd Job.
  def record_job(job_json)
    job = JSON.parse(job_json)
    ProcessingJob.create!(
      :document_id    => id,
      :account_id     => account_id,
      :cloud_crowd_id => job['id'],
      :title          => title,
      :remote_job     => job
    )
  end

  def save_page_text(modified_pages)
    eventual_access = self.access || PRIVATE
    self.update_attributes(
      :access       => PENDING,
      :text_changed => true
    )
    modified_pages.each_pair do |page_number, page_text|
      page = Page.find_by_document_id_and_page_number(id, page_number)
      page.text = page_text
      page.save
    end
    record_job(RestClient.post(DC::CONFIG['cloud_crowd_server'] + '/jobs', {:job => {
      'action'  => 'reindex_document',
      'inputs'  => [id],
      'options' => {
        :id      => id,
        :access  => eventual_access
      }
    }.to_json}).body)
  end

  # Redactions is an array of objects: {'page' => 1, 'location' => '30,50,50,10'}
  # The color can be 'black' or 'red'.
  def redact_pages(redactions, color='black')
    eventual_access = access || PRIVATE

    attributes = {:access => PENDING}
    unless original_extension.nil? or original_extension.downcase == 'pdf'
      asset_store.delete_original(self)
      attributes[:original_extension] = 'pdf'
    end

    update_attributes attributes
    record_job(RestClient.post(DC::CONFIG['cloud_crowd_server'] + '/jobs', {:job => {
      'action'  => 'redact_pages',
      'inputs'  => [id],
      'options' => {
        :id => id,
        :redactions => redactions,
        :access => eventual_access,
        :color => color
      }
    }.to_json}).body)
  end

  def remove_pages(pages, replace_pages_start=nil, insert_document_count=nil)
    eventual_access = access || PRIVATE
    update_attributes :access => PENDING
    record_job(RestClient.post(DC::CONFIG['cloud_crowd_server'] + '/jobs', {:job => {
      'action'  => 'document_remove_pages',
      'inputs'  => [id],
      'options' => {
        :id                    => id,
        :pages                 => pages,
        :access                => eventual_access,
        :replace_pages_start   => replace_pages_start,
        :insert_document_count => insert_document_count
      }
    }.to_json}).body)
  end

  def reorder_pages(page_order, eventual_access=nil)
    eventual_access ||= access || PRIVATE
    update_attributes :access => PENDING
    record_job(RestClient.post(DC::CONFIG['cloud_crowd_server'] + '/jobs', {:job => {
      'action'  => 'document_reorder_pages',
      'inputs'  => [id],
      'options' => {
        :id          => id,
        :page_order  => page_order,
        :access      => eventual_access
      }
    }.to_json}).body)
  end

  def assert_page_order(page_order)
    same_size = page_order.uniq.length == self.page_count
    same_max  = page_order.max == self.page_count
    same_min  = page_order.min == 1
    same_size && same_max && same_min
  end

  def queue_import(opts={})
    options = DEFAULT_IMPORT_OPTIONS.merge opts
    options[:access] ||= self.access || PRIVATE
    options[:id] = id
    self.update_attributes :access => PENDING
    record_job(DC::Import::CloudCrowdImporter.new.import([id], options, self.low_priority?).body)
  end

  def self.duplicate(document_ids, account, options={})
    RestClient.post(DC::CONFIG['cloud_crowd_server'] + '/jobs', {:job => {
      'action'  => 'duplicate_documents',
      'inputs'  => [document_ids],
      'options' => options.merge(
        :account_id => account.id
      )
    }.to_json})
  end

  # Create an identical clone of this document, in all ways (except for the ID).
  def duplicate!(account=nil, options={})
    # Clone the document.
    newattrs = attributes.merge({
      :access     => PENDING,
      :created_at => Time.now,
      :updated_at => Time.now
    })
    newattrs[:account_id] = account.id if account
    newattrs[:organization_id] = account.organization.id if account and not newattrs[:organization_id]
    copy     = Document.create!(newattrs.merge({:hit_count  => 0, :detected_remote_url => nil}))
    newattrs = {:document_id => copy.id}

    # Clone the docdata.
    if docdata and options['include_docdata']
      Docdata.create! docdata.attributes.merge newattrs
    end

    # Clone the associations.
    associations = [entities, entity_dates, pages]
    associations.push sections if options['include_sections']
    associations.push annotations.accessible(account) if options['include_annotations']
    associations.push project_memberships if options['include_project']
    associations.each do |association|
      association.each do |model|
        model.class.create! model.attributes.merge newattrs
      end
    end

    # Clone the assets.
    DC::Store::AssetStore.new.copy_assets(self, copy, self.access)

    # Reindex, set access.
    copy.index
    copy.set_access access

    copy
  end

  # TODO: Make the to_json an extended form of the canonical.
  def as_json(opts={})
    json = {
      :id                  => id,
      :organization_id     => organization_id,
      :account_id          => account_id,
      :created_at          => created_at.to_date.strftime(DISPLAY_DATE_FORMAT),
      :access              => access,
      :status              => status,
      :page_count          => page_count,
      :annotation_count    => annotation_count || 0,
      :public_note_count   => public_note_count,
      :title               => title,
      :slug                => slug,
      :source              => source,
      :description         => description,
      :organization_name   => organization_name,
      :organization_slug   => organization_slug,
      :account_name        => account_name,
      :account_slug        => account_slug,
      :related_article     => related_article,
      :pdf_url             => pdf_url,
      :thumbnail_url       => thumbnail_url( { :cache_busting => opts[:cache_busting] } ),
      :full_text_url       => full_text_url,
      :page_image_url      => page_image_url_template( { :cache_busting => opts[:cache_busting] } ),
      :document_viewer_url => document_viewer_url,
      :document_viewer_js  => canonical_url(:js),
      :reviewer_count      => reviewer_count,
      :study               => study,
      :detected_remote_url => detected_remote_url,
      :publish_at          => publish_at.as_json,
      :hits                => hits,
      :mentions            => mentions,
      :total_mentions      => total_mentions,
      :project_ids         => project_ids,
      :char_count          => char_count,
      :data                => data,
      :language            => language,
      :file_hash           => file_hash,
      :original_file_path  => original_url,
      :qa_note             => qa_note
    }
    if self.status == STATUS_IN_QC
      json[:de_one_id] = de_one_id
      json[:de_two_id] = de_two_id
    end

    if opts[:annotations]
      json[:annotations_url] = annotations_url if commentable?(opts[:account])
      json[:annotations] = self.annotations_with_authors(opts[:account])
    end

    json
  end

  # The filtered attributes we're allowed to display in the admin UI.
  def admin_attributes
    {
      :id                  => id,
      :account_name        => account_name,
      :organization_name   => organization_name,
      :page_count          => page_count,
      :thumbnail_url       => thumbnail_url,
      :pdf_url             => pdf_url(:direct),
      :public              => public?,
      :title               => public? ? title : nil,
      :source              => public? ? source : nil,
      :created_at          => created_at.to_datetime.strftime(DISPLAY_DATETIME_FORMAT),
      :remote_url          => remote_url,
      :detected_remote_url => detected_remote_url
    }
  end

  def canonical(options={})
    options = DEFAULT_CANONICAL_OPTIONS.merge(options)
    doc = ActiveSupport::OrderedHash.new
    doc['id']                 = canonical_id
    doc['title']              = title
    doc['access']             = ACCESS_NAMES[access] if options[:access]
    doc['status']             = status
    doc['pages']              = page_count
    doc['description']        = description
    doc['source']             = source
    doc['created_at']         = created_at.to_formatted_s(:rfc822)
    doc['updated_at']         = updated_at.to_formatted_s(:rfc822)
    doc['canonical_url']      = canonical_url(:html, options[:allow_ssl])
    doc['language']           = language
    doc['file_hash']          = file_hash
    if options[:contributor]
      doc['contributor']      = account_name
      doc['contributor_organization'] = organization_name
    end
    if self.status == STATUS_IN_QC
      doc['de_one_id'] = de_one_id
      doc['de_two_id'] = de_two_id
    end
    doc['display_language']   = display_language
    doc['resources']          = res = ActiveSupport::OrderedHash.new
    res['pdf']                = pdf_url
    res['text']               = full_text_url
    res['thumbnail']          = thumbnail_url
    res['search']             = search_url
    res['print_annotations']  = print_annotations_url
    res['translations_url']   = translations_url
    res['page']               = {}
    res['page']['image']      = page_image_url_template({ :local => options[:local], :cache_busting => options[:cache_busting] })
    res['page']['text']       = page_text_url_template(:local => options[:local])
    res['related_article']    = related_article if related_article
    res['annotations_url']    = annotations_url if commentable?(options[:account])
    res['qa_note']            = qa_note
    if options[:allow_detected]
      res['published_url']    = published_url if published_url
    else
      res['published_url']    = remote_url if remote_url
    end
    doc['sections']           = ordered_sections.map {|s| s.canonical } if options[:sections]
    doc['data']               = data if options[:data]
    doc['language']           = language
    if options[:annotations]
      doc['annotations']      = ordered_annotations(options[:account]).map {|a| a.canonical}
    end
    if self.mentions
      doc['mentions']         = self.mentions
    end
    doc
  end

  # Updates file_size and file_hash
  # Will default to reading the data from the asset_store
  # or can be passed arbitrary data such as from a file on disk
  def update_file_metadata( data = asset_store.read_original(self) )
    update_attributes!( :file_size => data.bytesize, :file_hash => Digest::SHA1.hexdigest( data ) )
  end


  def in_de?
    status == STATUS_DE1 || status == STATUS_DE2
  end

  def in_qc?
    status == STATUS_IN_QC
  end

  def in_qa?
    status == STATUS_IN_QA
  end

  def in_supp_de?
    status == STATUS_IN_SUPP_DE
  end

  def in_supp_qc?
    status == STATUS_IN_SUPP_QC
  end

  private
  
  def ensure_language_is_valid
    self.language = DC::Language::DEFAULT unless DC::Language::SUPPORTED.include?(language)
  end

  def ensure_titled
    self.title ||= DEFAULT_TITLE
    return true if self.slug
    slugged = self.title.mb_chars.normalize(:kd).gsub(/[^\x00-\x7F]/n, '').to_s # As ASCII
    slugged.gsub!(/[']+/, '') # Remove all apostrophes.
    slugged.gsub!(/\W+/, ' ') # All non-word characters become spaces.
    slugged.squeeze!(' ')     # Squeeze out runs of spaces.
    slugged.strip!            # Strip surrounding whitespace
    slugged.downcase!         # Ensure lowercase.
    # Truncate to the nearest space.
    if slugged.length > 50
      words = slugged[0...50].split(/\s|_|-/)
      slugged = words.length > 1 ? words[0, words.length - 1].join(' ') : words.first
    end
    slugged.gsub!(' ', '_')   # Dasherize spaces.
    self.slug = slugged.empty? ? "untitled" : slugged
    true
  end

  def background_update_asset_access(access_level)
    return update_attributes(:access => access_level) if Rails.env.development?
    RestClient.post(DC::CONFIG['cloud_crowd_server'] + '/jobs', {:job => {
      'action'  => 'update_access',
      'inputs'  => [self.id],
      'options' => {'access' => access_level},
      'callback_url' => "#{DC.server_root(:ssl => false)}/import/update_access"
    }.to_json})
  end

end
