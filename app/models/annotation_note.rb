class AnnotationNote < ActiveRecord::Base
  belongs_to :annotation
  belongs_to :supp_de_anno, :class_name => "Annotation", :foreign_key => :de_ref
  
  belongs_to :document
  belongs_to :group

  scope :for_doc,           ->( doc ) {
    if doc.in_supp_de?
      whereClause = "document_id=#{doc.id} AND annotation_notes.iteration=(SELECT (documents.iteration - 1) FROM documents WHERE documents.id=#{doc.id})"
    elsif doc.in_supp_qc?
      whereClause = "document_id=#{doc.id} AND annotation_notes.iteration=(SELECT (documents.iteration - 1) FROM documents WHERE documents.id=#{doc.id})"
    elsif doc.in_supp_qa?
      whereClause = "document_id=#{doc.id} AND annotation_notes.iteration=(SELECT documents.iteration FROM documents WHERE documents.id=#{doc.id})"
    else
      whereClause = {:document_id => doc.id}
    end

    where( whereClause )
  }


  #OPTS: Use_de_ref: Whether to refer to original reference or de_ref reference
  def as_json(opts)
    json = {
      :id               => id,
      :annotation_id    => annotation_id,
      :document_id      => document_id,
      :group_id         => group_id,
      :note             => note,
      :addressed        => addressed,
      :iteration        => iteration
    }

    if opts[:use_de_ref]
      if !group_id.nil?
        json[:group_id] = de_ref
      else
        json[:annotation_id] = supp_de_anno.id
      end
    end

    return json
  end
end
