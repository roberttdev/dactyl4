# The public DocumentCloud API.
class ApiController < ApplicationController
  include DC::Access
  include DC::Search::Controller

  layout 'workspace'

  before_action :prefer_secure, :only => [:index]

  skip_before_action :verify_authenticity_token

  before_action :secure_only,        :only => [:upload, :project, :projects, :upload, :destroy, :create_project, :update_project, :destroy_project]
  before_action :api_login_required, :only => [:upload, :project, :projects, :update, :destroy, :create_project, :update_project, :destroy_project]
  before_action :api_login_optional, :only => [:documents, :search, :notes, :pending, :entities]
  before_filter :maybe_set_cors_headers

  def index
    redirect_to '/help/api'
  end

  def cors_options
    return bad_request unless params[:allowed_methods]
    maybe_set_cors_headers
    render :nothing => true
  end

  def search
    opts = API_OPTIONS.merge(pick(params, :sections, :annotations, :entities, :mentions, :data))
    if opts[:mentions] &&= opts[:mentions].to_i
      opts[:mentions] = 10  if opts[:mentions] > 10
      opts[:mentions] = nil if opts[:mentions] < 1
    end
    respond_to do |format|
      format.any(:js, :json) do
        perform_search :mentions => opts[:mentions]
        @response = {
          total:    @query.total,
          page:     @query.page,
          per_page: @query.per_page,
          q:        params[:q],
          documents: @documents.map {|d| d.canonical(opts) }
        }
        json_response
      end
    end
  end

  # Upload API, similar to our internal upload API for starters. Parameters:
  # file, title, access, source, description.
  # The `file` must either be a multipart file upload, or a URL to a remote doc.
  def upload
    secure_silence_logs do
      return bad_request unless params[:file] && params[:title] && current_account
      is_file = params[:file].respond_to?(:path)
      if !is_file && !(URI.parse(params[:file]) rescue nil)
        return render({
          :json => {:message => "The 'file' parameter must be the contents of a file or a URL."},
          :status => 400
        })
      end
      
      if params[:file_hash] && Document.accessible(current_account, current_organization).exists?(:file_hash=>params[:file_hash])
        return render({ 
          :status=>409, 
          :json => "This file is a duplicate of an existing one you have access to" 
        })
      end
      params[:url] = params[:file] unless is_file
      @response = Document.upload(params, current_account, current_organization).canonical
      json_response
    end
  end


  # Retrieve a document's canonical JSON.
  def documents
    return bad_request unless params[:id] and request.format.json? || request.format.js? || request.format.text?
    return not_found unless current_document
    opts                     = {:access => true, :sections => true, :annotations => true, :data => true}
    if current_account
      opts[:account]           = current_account
      opts[:allowed_to_edit]   = current_account.allowed_to_edit?(current_document)
      opts[:allowed_to_review] = current_account.reviews?(current_document)
    end
    @response                = {'document' => current_document.canonical(opts)}
    respond_to do |format|
      format.text do
        direct = [PRIVATE, ORGANIZATION, EXCLUSIVE].include? current_document.access
        redirect_to(current_document.full_text_url(direct))
      end
      format.json { json_response }
      format.js { json_response }
    end
  end

  def pending
    @response = { :total_documents => Document.pending.count }
    @response[:your_documents] = current_account.documents.pending.count if logged_in?
    json_response
  end

  # Retrieve a note's canonical JSON.
  def notes
    return bad_request unless params[:note_id] and request.format.json? || request.format.js?
    return not_found unless current_note
    @response = {'annotation' => current_note.canonical}
    json_response
  end

  # Retrieve the entities for a document.
  def entities
    return bad_request unless params[:id] and request.format.json? || request.format.js?
    return not_found unless current_document
    @response = {'entities' => current_document.ordered_entity_hash}
    json_response
  end

  def update
    return bad_request unless params[:id] and request.format.json? || request.format.js?
    return not_found unless doc = current_document
    attrs = pick(params, :access, :title, :description, :source, :related_article, :published_url, :data)
    attrs[:access] = ACCESS_MAP[attrs[:access].to_sym] if attrs[:access]
    success = doc.secure_update attrs, current_account
    return json(doc, 403) unless success
    expire_page doc.canonical_cache_path if doc.cacheable?
    @response = {'document' => doc.canonical(:access => true, :sections => true, :annotations => true)}
    json_response
  end

  def destroy
    return bad_request unless request.delete?
    return not_found   unless doc = current_document
    return forbidden   unless current_account && current_account.owns_or_collaborates?(doc)
    doc.destroy
    json nil
  end

  # Retrieve information about one project
  def project
    return forbidden unless current_account and params[:id] and (request.format.json? || request.format.js? || request.format.text?)
    project = Project.accessible(current_account).find(params[:id].to_i)
    return not_found unless project
    opts = { :include_document_ids => params[:include_document_ids] != 'false' }
    @response = {'project' => project.canonical(opts)}
    json_response
  end

  # Retrieve a listing of your projects, including document id.
  def projects
    return forbidden unless current_account # already returns a 401 if credentials aren't supplied
    opts = { :include_document_ids => params[:include_document_ids] != 'false' }
    @response = {'projects' => Project.accessible(current_account).map {|p| p.canonical(opts) } }
    json_response
  end

  def create_project
    attrs = pick(params, :title, :description)
    attrs[:document_ids] = (params[:document_ids] || []).map(&:to_i)
    @response = {'project' => current_account.projects.create(attrs).canonical}
    json_response
  end

  def update_project
    data = pick(params, :title, :description, :document_ids)
    ids  = (data.delete(:document_ids) || []).map(&:to_i)
    doc_ids = Document.accessible(current_account, current_organization).where({ :id => ids }).pluck( 'id' )
    current_project.set_documents( doc_ids )
    current_project.update_attributes data
    @response = {'project' => current_project.reload.canonical}
    json_response
  end

  def destroy_project
    current_project.destroy
    json nil
  end

  # Allow logging of all actions, apart from secure uploads.
  def logger
    params[:secure] ? nil : super
  end


  # Create a new image crop.  Expects image name, top-left x and y, height and weight (all 4 represented as a ratio)
  # of document's dimension
  def crop_image
    # Check the requester's permissions
    return forbidden unless !current_account.nil?

    #Get document reference
    doc_id = params[:img_name].split('documents/')[1].split('/')[0]
    doc = Document.find(doc_id)

    #Extract image name
    img_name = params[:img_name].split('/').last

    #Instruct asset store to extract graph
    graph_image = DC::Store::AssetStore.new.create_graph_image(doc, img_name, params[:w_ratio], params[:h_ratio], params[:x_ratio], params[:y_ratio])
    json({:filename => "#{DC.server_root}/#{graph_image}"})
  end


  #Return the possible templated fields for a Measurement
  def measurement_fields
    json(GroupTemplate.where({:name => 'Measurement'}).first.template_fields.select(:id, :field_name))
  end







  private

  def secure_silence_logs
    if params[:secure]
      Rails.logger.silence { yield }
    else
      yield
    end
  end

  def current_project
    @current_project ||= current_account.projects.find(params[:id].to_i)
  end

  def current_document
    @current_document ||= Document.accessible(current_account, current_organization).find_by_id(params[:id].to_i)
  end

  def current_note
    @current_note ||= Annotation.accessible(current_account).find_by_id(params[:note_id].to_i)
  end

end
