class GroupTemplate < ActiveRecord::Base
  has_many :template_fields, :foreign_key => 'template_id', :dependent => :delete_all
  has_many :subtemplates, :foreign_key => 'template_id', :dependent => :delete_all
end
