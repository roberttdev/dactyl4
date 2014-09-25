class AnnotationNote < ActiveRecord::Base
  belongs_to :annotation_group
  belongs_to :document
end
