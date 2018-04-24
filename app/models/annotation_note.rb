class AnnotationNote < ActiveRecord::Base
  belongs_to :annotation
  belongs_to :supp_de_ag, :class_name => "AnnotationGroup", :foreign_key => :de_ref
  
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
        json[:annotation_group] = {
          :id             => supp_de_ag.id,
          :annotation_id  => supp_de_ag.annotation_id,
          :group_id       => supp_de_ag.group_id
        }
      end
    else
      if self.annotation_group
        json[:annotation_group] = {
          :id             => annotation_group_id,
          :annotation_id  => annotation_group.annotation_id,
          :group_id       => annotation_group.group_id
        }
      else
        json[:annotation_group] = nil
      end
    end

    return json
  end
end
