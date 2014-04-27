class CreateTemplateFields < ActiveRecord::Migration
  def self.up
    create_table :template_fields do |t|
      t.integer :template_id, :null=>false
      t.text :field_name, :null => false

      t.timestamps
    end
  end

  def self.down
    drop_table :template_fields
  end
end
