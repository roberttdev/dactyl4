class TemplateField < ActiveRecord::Base
  belongs_to :group_template, :foreign_key => "template_id"
  has_many :subtemplate_fields, :foreign_key => "field_id", :dependent => :delete_all

end
