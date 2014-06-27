class AnnotationGroup < ActiveRecord::Base
  belongs_to :group
  belongs_to :annotation

  after_destroy {
    #Destroy annotation as well if no other groups link to it
    if !AnnotationGroup.exists?({annotation_id: self.annotation_id})
      Annotation.find(self.annotation_id).destroy
    end
  }
end
