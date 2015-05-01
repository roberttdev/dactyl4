class FileNotesController < ApplicationController

  def index
    json AnnotationNote.includes(:annotation_group).where({document_id: params[:document_id]})
  end

  def update
    json AnnotationNote.update(params[:id], :addressed => params[:addressed])
  end
end
