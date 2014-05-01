class CreateGroups < ActiveRecord::Migration
  def self.up
    create_table :groups do |t|
      t.text :name, :null => false
      t.integer :parent_id
      t.integer :template_id
      t.integer :document_id

      t.timestamps
    end

    add_index :groups, :parent_id, :name => 'index_parent_group'
    add_index :groups, :template_id, :name => 'index_template_used'
    add_index :groups, :document_id, :name => 'index_group_document'

  end

  def self.down
    remove_index :groups, :name => 'index_parent_group'
    remove_index :groups, :name => 'index_template_used'
    remove_index :groups, :name => 'index_group_document'
    drop_table :groups
  end
end
