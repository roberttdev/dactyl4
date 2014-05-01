class GroupTemplate < ActiveRecord::Base
  has_many :template_fields, :foreign_key => 'template_id', :dependent => :delete_all
  has_many :subtemplates, -> { order(sub_name: :asc) }, :foreign_key => 'template_id', :dependent => :delete_all
  has_many :groups, :foreign_key => 'template_id'
end
