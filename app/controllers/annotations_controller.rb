class AnnotationsController < ApplicationController
  include DC::Access

  layout false

  before_action :login_required, :except => [:index, :show, :print,:cors_options]
  skip_before_action :verify_authenticity_token

  # In the workspace, request a listing of annotations.
  def index
    searchParams = {:document_id => params[:document_id], :account_id => current_account.id}
    if(params['all'] != 'true')
      searchParams[:group_id] = params[:group_id] != "" ? params[:group_id] : nil
    end
    annotations = Annotation.where(searchParams)
    json annotations
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
    end
  end

  # Print out all the annotations for a document (or documents.)
  def print
    docs = Document.accessible(current_account, current_organization).where( :id => params[:docs] )
    Document.populate_annotation_counts(current_account, docs)
    @documents_json = docs.map {|doc| doc.to_json(:annotations => true, :account => current_account) }
    render :layout => false
  end

  # Any account can create a private note on any document.
  # Only the owner of the document is allowed to create a public annotation.
  def create
    maybe_set_cors_headers
    note_attrs = pick(params, :page_number, :title, :content, :location, :access)
    note_attrs[:access] = ACCESS_MAP[note_attrs[:access].to_sym]
    doc = current_document
    return forbidden unless note_attrs[:access] == PRIVATE || current_account.allowed_to_comment?(doc)
    expire_page doc.canonical_cache_path if doc.cacheable?
    anno = doc.annotations.create(note_attrs.merge(
      :account_id      => current_account.id
    ))
    json current_document.annotations_with_authors(current_account, [anno]).first
  end

  # You can only alter annotations that you've made yourself.
  def update
    maybe_set_cors_headers
    return not_found unless anno = current_annotation
    if !current_account.allowed_to_edit?(anno)
      anno.errors.add(:base, "You don't have permission to update the note.")
      return json(anno, 403)
    end
    attrs = pick(params, :title, :content, :access)
    attrs[:access] = DC::Access::ACCESS_MAP[attrs[:access].to_sym]
    anno.update_attributes(attrs)
    expire_page current_document.canonical_cache_path if current_document.cacheable?
    expire_page current_annotation.canonical_cache_path if current_annotation.cacheable?
    anno.reset_public_note_count
    json anno
  end

  def destroy
    maybe_set_cors_headers
    return not_found unless anno = current_annotation

    group_id = params[:group_id] == "" ? nil : params[:group_id]
    ag = AnnotationGroup.where({group_id: group_id, annotation_id: params[:id]})
    ag.destroy_all
    expire_page current_document.canonical_cache_path if current_document.cacheable?
    json nil
  end

  def cors_options
    return bad_request unless params[:allowed_methods]
    maybe_set_cors_headers
    render :nothing => true
  end

  def bulk_update
    group_id = params[:group_id]
    params[:bulkData].each do |field|
      submitHash = pick(field, :document_id, :page_number, :title, :content, :location, :templated, :qc_approved)
      submitHash[:access] = DC::Access::PUBLIC
      submitHash[:location] = submitHash[:location] ? submitHash[:location][:image] : nil
      if field[:id].nil?
        submitHash[:account_id] = current_account.id
        anno = Annotation.create(submitHash)
      else
        anno = Annotation.update(field[:id], submitHash)
      end

      if anno.annotation_groups.where({:group_id => group_id}).size < 1
       AnnotationGroup.create({
            :group_id       => group_id,
            :annotation_id  => anno.id
        })
      end
    end
    json Annotation.includes(:groups).where({:document_id => params[:document_id], 'groups.id' => group_id})
  end

  #Remove QC approval from QC'd anno
  def un_qc
    anno = Annotation.update(params[:id], {:qc_approved => false})

  end

  private


  def current_annotation
    @current_annotation ||= current_document.annotations.find_by_id(params[:id])
  end

  def current_document
    @current_document ||= Document.accessible(current_account, current_organization).find(params[:document_id])
  end

end
