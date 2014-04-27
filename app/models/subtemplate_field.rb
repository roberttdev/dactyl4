class SubtemplateField < ActiveRecord::Base
  belongs_to :subtemplate
  has_one :template_field
end
