class FileNotesController < ApplicationController

  def index
    doc = Document.find(params[:document_id])
    includes = doc.in_supp_de? ? [:supp_de_ag] : [:annotation_group]

    json AnnotationNote.eager_load(includes).for_doc(doc).as_json({use_de_ref: doc.in_supp_de?})
  end

  def update
    json AnnotationNote.update(params[:id], :addressed => params[:addressed])
  end
end
