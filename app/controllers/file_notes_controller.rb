class FileNotesController < ApplicationController

  def index
    json AnnotationNote.includes(:annotation_group).where({document_id: params[:document_id]})
  end

  def update
    AnnotationNote.update(params[:id], :addressed => params[:addressed])
  end
end
