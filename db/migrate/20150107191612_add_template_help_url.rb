class AddTemplateHelpUrl < ActiveRecord::Migration
  def change
    add_column :group_templates, :help_url, :text
  end
end
