class CreateSubtemplateFields < ActiveRecord::Migration
  def self.up
    create_table :subtemplate_fields do |t|
      t.integer :subtemplate_id, :null => false
      t.integer :field_id, :null => false

      t.timestamps
    end
  end

  def self.down
    drop_table :subtemplate_fields
  end
end
