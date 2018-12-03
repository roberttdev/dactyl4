class AnnotationNote < ActiveRecord::Base
  belongs_to :annotation
  
  belongs_to :document
  belongs_to :group

  scope :for_doc,           ->( doc ) {
    if doc.in_supp_de?
      whereClause = "annotation_notes.document_id=#{doc.id} AND annotation_notes.iteration=(SELECT (documents.iteration - 1) FROM documents WHERE documents.id=#{doc.id})"
    elsif doc.in_supp_qc?
      whereClause = "annotation_notes.document_id=#{doc.id} AND annotation_notes.iteration=(SELECT (documents.iteration - 1) FROM documents WHERE documents.id=#{doc.id})"
    elsif doc.in_supp_qa?
      whereClause = "annotation_notes.document_id=#{doc.id} AND annotation_notes.iteration=(SELECT documents.iteration FROM documents WHERE documents.id=#{doc.id})"
    else
      whereClause = {:document_id => doc.id}
    end

    where( whereClause )
  }


  #OPTS: Use_de_ref: Whether to refer to original reference or de_ref reference
  def as_json()
    json = {
      :id               => id,
      :annotation_id    => annotation_id,
      :document_id      => document_id,
      :group_id         => (group_id.nil?) ? annotation.group_id : group_id,
      :note             => note,
      :addressed        => addressed,
      :iteration        => iteration
    }

    return json
  end
end
