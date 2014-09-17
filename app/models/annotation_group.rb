class AnnotationGroup < ActiveRecord::Base
  belongs_to :group
  belongs_to :annotation

  has_many :approvals, :class_name => 'AnnotationGroup', :foreign_key => 'based_on'

  after_destroy {
    #Destroy annotation as well if no other groups link to it
    if !AnnotationGroup.exists?({annotation_id: self.annotation_id})
      Annotation.find(self.annotation_id).destroy
    end
  }

  #Return stripped-down json indicating group and approval count
  def approval_json(in_qa)
    json = {
        :group_id => group_id,
        :approved_count => !in_qa ? approved_count : (qa_approved_by ? 1 : 0)
    }
  end

end
