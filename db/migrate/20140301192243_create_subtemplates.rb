class CreateSubtemplates < ActiveRecord::Migration
  def self.up
    create_table :subtemplates do |t|
      t.integer :template_id, :null => false
      t.text :sub_name, :null => false

      t.timestamps
    end
  end

  def self.down
    drop_table :subtemplates
  end
end
