class AnnotationNote < ActiveRecord::Base
  belongs_to :annotation_group
  belongs_to :document
  belongs_to :group

  def to_json
    {
        :annotation_group_id => annotation_group_id,
        :group_id            => group_id,
        :note                => note,
        :addressed           => addressed
    }
  end
end
