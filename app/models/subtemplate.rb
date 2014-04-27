class Subtemplate < ActiveRecord::Base
  belongs_to :group_template
  has_many :subtemplate_fields, :dependent => :delete_all
end
