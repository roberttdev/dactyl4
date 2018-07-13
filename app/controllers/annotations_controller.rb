class AnnotationsController < ApplicationController
  include DC::Access

  layout false

  before_action :login_required, :except => [:index, :show, :print,:cors_options]
  skip_before_action :verify_authenticity_token

  # In the workspace, request a listing of annotations.
  def index
    doc = Document.find(params[:document_id])
    if doc.in_de?
      searchParams = {:document_id => params[:document_id], :account_id => current_account.id}
      if(params['all'] != 'true')
        searchParams[:group_id] = params[:group_id] != "" ? params[:group_id] : nil
      end
    elsif doc.in_qc?
      #For QC, this is used for DV -- return only DE anno-groups
      searchParams = {:document_id => params[:document_id], "annotation_groups.based_on" => nil}
    end
    annotations = Annotation.includes(:document).where(searchParams)
    json annotations.map {|a| a.canonical }
  end

  def show
    return not_found unless current_annotation
    respond_to do |format|
      format.js do
        json = current_annotation.canonical(:include_image_url => true, :include_document_url => true).to_json
        js = "dc.embed.noteCallback(#{json})"
        cache_page js if current_annotation.cacheable? && PUBLIC_LEVELS.include?(current_document.access)
        render :js => js
      end
      format.json do
        @response = current_annotation.canonical
        json_response
      end
    end
  end

  # Print out all the annotations for a document (or documents.)
  def print
    docs = Document.accessible(current_account, current_organization).where( :id => params[:docs] )
    Document.populate_annotation_counts(current_account, docs)
    @documents_json = docs.map {|doc| doc.to_json(:annotations => true, :account => current_account) }
    render :layout => false
  end


  def create
    doc = Document.find(params[:document_id])

    submitHash = pick(params, :based_on, :content, :document_id, :group_id, :highlight_id, :location, :page_number, :templated, :title)
    submitHash[:access] = DC::Access::PUBLIC

    #In certain modes, update creator and iteration
    if doc.in_de? || doc.in_qc? || doc.in_supp_de? || doc.in_extraction?
        submitHash[:account_id] = current_account.id
        submitHash[:iteration] = doc.iteration
        anno = Annotation.create(submitHash)
    end

    json(anno)
  end

  # You can only alter annotations that you've made yourself.
  def update
    maybe_set_cors_headers
    return not_found unless anno = current_annotation

    attrs = pick(params, :title, :content, :access, :highlight_id)
    attrs[:access] = DC::Access::ACCESS_MAP[attrs[:access].to_sym]

    expire_page current_document.canonical_cache_path if current_document.cacheable?
    expire_page current_annotation.canonical_cache_path if current_annotation.cacheable?

    #Annos can exist without highlights.  If there is no highlight assigned but a location is passed, create one
    if( attrs[:highlight_id].nil? && params[:location] ) then
        highl = Highlight.create({
                                     document_id: params[:document_id],
                                     location: params[:location],
                                     page_number: params[:page_number]
                                 })
        attrs[:highlight_id] = highl.id
    end

    if params[:updateAll] == true
        #If update all, update other annos on this highlight that match
        annos = Highlight.find(params[:highlight_id]).annotations.where({title: anno.title, content: anno.content})
        annos.each do |eachAnno|
            eachAnno.update_attributes(attrs)
            eachAnno.reset_public_note_count
        end
        anno = Annotation.find(anno.id)
    else
        #Otherwise just update the one
        anno.update_attributes(attrs)
        anno.reset_public_note_count
    end
    json(anno)
  end

  def destroy
    maybe_set_cors_headers
    return not_found unless anno = current_annotation

    Annotation.destroy(params[:id])
    expire_page current_document.canonical_cache_path if current_document.cacheable?
    json nil
  end

  def cors_options
    return bad_request unless params[:allowed_methods]
    maybe_set_cors_headers
    render :nothing => true
  end

  #Updates many annotations at once.. needs update to new models (if still used)
  def bulk_update
    doc = Document.find(params[:document_id])
    group_id = params[:group_id]
    account_id = doc.in_qa? ? doc.qc_id : current_account.id
    #If no group ID passed, use base group
    group_id = Group.base(doc, current_account.id, nil, nil).id if group_id.nil?

    params[:bulkData].each do |field|
      submitHash = pick(field, :document_id, :title, :content, :templated, :group_id)
      submitHash[:access] = DC::Access::PUBLIC
      submitHash[:location] = field[:highlight][:location][:image]
      submitHash[:highlight_id] = field[:highlight][:id]
      submitHash[:page_number] = field[:highlight][:page_number]

      #In DE or Extract mode, create/update the base annotation
      if doc.in_de? || doc.in_supp_de? || doc.in_extraction?
        if field[:id].nil?
          submitHash[:account_id] = current_account.id
          submitHash[:iteration] = doc.iteration
          anno = Annotation.create(submitHash)
        else
          submitHash[:account_id] = current_account.id
          anno = Annotation.update(field[:id], submitHash)
        end
      end

      #Update with new data if in QA
      if doc.in_qa? || doc.in_supp_qa?
        anno.update_qa_status(field[:approved], field[:qa_reject_note], current_account.id, doc.id)
      elsif doc.in_extraction?
        anno.update_attributes({:qa_approved_by => current_account.id})
      end
    end
    json Annotation.where({:document_id => params[:document_id], :group_id => group_id})
  end
  

  #Return top 10 unique annotation names that match search term
  def search
    searchTerm = params[:term] + '%'
    json Annotation.uniq.joins(:annotation_groups)
              .where("annotation_groups.qa_approved_by IS NOT NULL AND title ILIKE ?", searchTerm )
              .order(:title).limit(10).pluck(:title)
  end

  private


  def current_annotation
    @current_annotation ||= current_document.annotations.find_by_id(params[:id])
  end

  def current_document
    @current_document ||= Document.accessible(current_account, current_organization).find(params[:document_id])
  end

end
