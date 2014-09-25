class DocumentsController < ApplicationController
  include DC::DocumentStatus

  layout nil

  before_action :bouncer,             :only => [:show] if Rails.env.staging?
  before_action :login_required,      :only => [:update, :destroy]
  before_action :prefer_secure,       :only => [:show]
  before_action :api_login_optional,  :only => [:send_full_text, :send_pdf, :send_page_text, :send_page_image]
  before_action :set_p3p_header,      :only => [:show]
  after_action  :allow_iframe,        :only => [:show]
  skip_before_action :verify_authenticity_token, :only => [:send_page_text]

  SIZE_EXTRACTOR        = /-(\w+)\Z/
  PAGE_NUMBER_EXTRACTOR = /-p(\d+)/

  def show
    Account.login_reviewer(params[:key], session, cookies) if params[:key]
    doc = current_document(true)
    return forbidden if doc.nil? && Document.exists?(params[:id].to_i)
    #Block if another doc of this status already claimed
    return forbidden if current_account.has_claims?(claimed_status(doc.status), doc.id) || doc.has_completed_claim?(current_account)

    #If not claimed yet, and it can be, submit claim
    doc.claim(current_account) if doc.claimable? && !doc.has_open_claim?(current_account)

    return render :file => "#{Rails.root}/public/doc_404.html", :status => 404 unless doc
    respond_to do |format|
      format.html do
        @no_sidebar = (params[:sidebar] || '').match /no|false/
        populate_editor_data if current_account && current_organization
        return if date_requested?
        return if entity_requested?
      end
      format.pdf  { redirect_to(doc.pdf_url) }
      format.text { redirect_to(doc.full_text_url) }
      format.json do
        @response = doc.canonical
        json_response
      end
      format.js do
        js = "DV.loadJSON(#{doc.canonical.to_json});"
        cache_page js if doc.cacheable?
        render :js => js
      end
      format.xml do
        render :xml => doc.canonical.to_xml(:root => 'document')
      end
      format.rdf do
        @doc = doc
      end
    end
  end

  def update
    return not_found unless doc = current_document(true)
    attrs = pick(params, :access, :title, :description, :source,
                         :related_article, :study, :publish_at, :data, :language)
    success = doc.secure_update attrs, current_account
    return json(doc, 403) unless success
    if doc.cacheable?
      expire_page doc.canonical_cache_path
      doc.annotations.each{ |note| expire_page note.canonical_cache_path }
    end
    Document.populate_annotation_counts(current_account, [doc])
    json doc
  end

  def destroy
    return not_found unless doc = current_document(true)
    if !current_account.owns_or_collaborates?(doc)
      doc.errors.add(:base, "You don't have permission to delete the document." )
      return json(doc, 403)
    end
    if doc.cacheable?
      expire_page doc.canonical_cache_path
      doc.annotations.each{ |note| expire_page note.canonical_cache_path }
    end
    doc.destroy
    json nil
  end

  def redact_pages
    return not_found unless params[:redactions] && (doc = current_document(true))
    doc.redact_pages JSON.parse(params[:redactions]), params[:color]
    json doc
  end

  def remove_pages
    return not_found unless doc = current_document(true)
    doc.remove_pages(params[:pages].map {|p| p.to_i })
    json doc
  end

  def reorder_pages
    return not_found unless doc = current_document(true)
    return json(nil, 409) if params[:page_order].length != doc.page_count
    doc.reorder_pages params[:page_order].map {|p| p.to_i }
    json doc
  end

  def upload_insert_document
    return not_found unless doc = current_document(true)
    return json(nil, 409) unless params[:file] && params[:document_number] && (params[:insert_page_at] || params[:replace_pages_start])

    DC::Import::PDFWrangler.new.ensure_pdf(params[:file], params[:Filename]) do |path|
      DC::Store::AssetStore.new.save_insert_pdf(doc, path, params[:document_number]+'.pdf')
      if params[:document_number] == params[:document_count]
        if params[:replace_pages_start]
          range = (params[:replace_pages_start].to_i..params[:replace_pages_end].to_i).to_a
          doc.remove_pages(range, params[:replace_pages_start].to_i, params[:document_count].to_i)
        else
          doc.insert_documents(params[:insert_page_at], params[:document_count].to_i)
        end
      end
    end

    if params[:multi_file_upload]
      json doc
    else
      @document = doc
    end
  end

  def save_page_text
    return not_found unless doc = current_document(true)
    modified_pages = JSON.parse(params[:modified_pages])
    doc.save_page_text(modified_pages) unless modified_pages.empty?
    json doc
  end

  def loader
    render :action => 'loader.js.erb', :content_type => :js
  end

  def entities
    ids = Document.accessible(current_account, current_organization).where({:id => params[:ids]}).pluck('id')
    json 'entities' => Entity.where({ :document_id => ids })
  end

  def entity
    if params[:entity_id]
      entity = Entity.find(params[:entity_id])
      entities = []
      entities << entity if Document.accessible(current_account, current_organization).find_by_id(entity.document_id)
    else
      ids = Document.accessible(current_account, current_organization).where({:id => params[:ids]}).pluck('id')
      entities = Entity.search_in_documents(params[:kind], params[:value], ids)
    end
    json({'entities' => entities}.to_json(:include_excerpts => true))
  end

  def dates
    if params[:id]
      result = {}
      entity = EntityDate.find(params[:id])
      if Document.accessible(current_account, current_organization).find_by_id(entity.document_id)
        result = {'date' => entity}.to_json(:include_excerpts => true)
      end
      return json(result)
    end

    ids = Document.accessible(current_account, current_organization).where({:id => params[:ids]}).pluck('id')
    dates = EntityDate.where( :document_id => ids).includes(:document)
    json({'dates' => dates}.to_json)
  end

  def occurrence
    entity = Entity.find(params[:id])
    occurrence = Occurrence.new(*(params[:occurrence].split(':') + [entity]))
    json :excerpts => entity.excerpts(200, {}, [occurrence])
  end

  def mentions
    return not_found unless doc = current_document(true)
    mention_data = Page.mentions(doc.id, params[:q], nil)
    json :mentions => mention_data[:mentions], :total_mentions => mention_data[:total]
  end

  # Allows us to poll for status updates in the in-progress document uploads.
  def status
    docs = Document.accessible(current_account, current_organization).where({:id => params[:ids]})
    Document.populate_annotation_counts(current_account, docs)
    render :json => { 'documents' => docs.map{|doc| doc.as_json(:cache_busting=>true) } }
  end

  # TODO: Fix the note/annotation terminology.
  def per_page_note_counts
    json current_document(true).per_page_annotation_counts
  end

  def queue_length
    json 'queue_length' => Document.pending.count
  end

  def reprocess_text
    return not_found unless doc = current_document(true)
    return json(nil, 403) unless current_account.allowed_to_edit?(doc)
    doc.reprocess_text(params[:ocr])
    json nil
  end

  def send_original
    return not_found unless current_document(true)
    redirect_to current_document.orig_doc_url(:direct)
  end

  def send_pdf
    return not_found unless current_document(true)
    redirect_to current_document.pdf_url(:direct)
  end

  def send_page_image
    return not_found unless current_page
    size = params[:page_name][SIZE_EXTRACTOR, 1]
    response.headers["Cache-Control"] = "no-store"
    redirect_to(current_page.authorized_image_url(size))
  end

  def send_full_text
    return not_found unless current_document(true)
    redirect_to current_document.full_text_url(:direct)
  end

  def send_page_text
    return not_found unless current_page
    @response = current_page.text
    return if jsonp_request?
    render :text => @response
  end

  def set_page_text
    return not_found unless current_page
    return forbidden unless current_account.allowed_to_edit?(current_page)
    json current_page.update_attributes(pick(params, :text))
  end

  def search
    doc       = current_document(true)
    pages     = Page.search_for_page_numbers(params[:q], doc)
    @response = {'query' => params[:q], 'results' => pages}
    json_response
  end

  def preview
    return unless login_required
    doc = current_document(true)
    return forbidden if doc.nil? && Document.exists?(params[:id].to_i)
    return not_found unless doc
    @options = params[:options]
  end


  #Drop the current user's claim to the document (if any)
  def drop_claim
    doc = current_document(true)
    return forbidden if !doc.has_open_claim?(current_account)

    doc.drop_claim(current_account)

    json_response
  end


  #Mark the current user's work on the document as completed
  def mark_complete
    doc = Document.find(params[:id].to_i)
    return forbidden if !doc.has_open_claim?(current_account)

    #Pull completion-related data and attach it to doc
    if doc.in_qc?
      doc.de_one_rating = params[:de_one_rating]
      doc.de_two_rating = params[:de_two_rating]
      doc.qc_note = params[:qc_note]
    end

    errorResp = doc.mark_complete(current_account)
    if errorResp
      json errorResp, 500
    else
      #If doc went to Supp DE and user requested to be assigned to it, then do so
      if doc.status == STATUS_READY_SUPP_DE && (params[:assign_to_me] == true)
        doc.update_attributes({status: STATUS_IN_SUPP_DE, de_one_id: current_account.id})
      end

      json_response
    end
  end


  #QC rejection of DE work
  def reject_de
    doc = current_document(true)
    if !doc.reject_de(current_account.id, params[:de])
      json 'You do not have access to reject data entry on this document.', 500
    else
      json_response
    end
  end


  private

  def populate_editor_data
    @edits_enabled = true
    @allowed_to_edit = current_document.status == STATUS_DE1 || current_document.status == STATUS_DE2
    if current_document.status == STATUS_IN_QC
      @orientation = 'vertical'
    else
      @orientation = 'horizontal'
    end
    @allowed_to_review = current_account.reviews?(current_document)
    @reviewer_inviter = @allowed_to_review && current_document.reviewer_inviter(current_account) || nil
    @template_list =  GroupTemplate.includes(:subtemplates).order(:name).all()
    @template_list = @template_list.to_json(:include => :subtemplates)
  end

  def date_requested?
    return false unless params[:date]
    begin
      date = Time.at(params[:date].to_i).to_date
    rescue RangeError => e
      return false
    end
    meta = current_document.entity_dates.where(:date=>date).first
    redirect_to current_document.document_viewer_url(:date => meta, :allow_ssl => true)
  end

  def entity_requested?
    return false unless params[:entity]
    meta = current_document.entities.find(params[:entity])
    page = Occurrence.new(params[:offset], 0, meta).page
    redirect_to current_document.document_viewer_url(:entity => meta, :page => page.page_number, :offset => params[:offset], :allow_ssl => true)
  end

  def current_document(exists=false)
    @current_document ||= exists ?
      Document.accessible(current_account, current_organization).find_by_id(params[:id].to_i) :
      Document.new(:id => params[:id].to_i)
  end

  def current_page
    num = params[:page_name][PAGE_NUMBER_EXTRACTOR, 1]
    return false unless num
    return false unless current_document(true)
    @current_page ||= current_document.pages.find_by_page_number(num.to_i)
  end

end
