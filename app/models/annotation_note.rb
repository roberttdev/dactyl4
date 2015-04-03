class AnnotationNote < ActiveRecord::Base
  belongs_to :annotation_group
  belongs_to :document
  belongs_to :group

  def as_json(opts)
    json = {
      :group_id         => group_id,
      :note             => note,
      :addressed        => addressed
    }

    if self.annotation_group
      json[:annotation_group] = {
        :id             => annotation_group_id,
        :annotation_id  => annotation_group.annotation_id,
        :group_id       => annotation_group.group_id
      }
    else
      json[:annotation_group] = nil
    end

    return json
  end
end
