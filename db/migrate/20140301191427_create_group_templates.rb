class CreateGroupTemplates < ActiveRecord::Migration
  def self.up
    create_table :group_templates do |t|
      t.text :name, :null => false

      t.timestamps
    end
  end

  def self.down
    drop_table :group_templates
  end
end
