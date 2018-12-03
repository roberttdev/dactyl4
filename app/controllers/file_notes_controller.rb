class FileNotesController < ApplicationController

  def index
    doc = Document.find(params[:document_id])
    includes = [:annotation]

    json AnnotationNote.eager_load(includes).for_doc(doc).as_json()
  end

  def update
    json AnnotationNote.update(params[:id], :addressed => params[:addressed])
  end
end
