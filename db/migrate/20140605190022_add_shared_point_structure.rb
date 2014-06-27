class AddSharedPointStructure < ActiveRecord::Migration
  def self.up
    create_table :annotation_groups do |t|
      t.integer :annotation_id
      t.integer :group_id
    end

    remove_index :annotations, :name=>'index_annotation_group'
    add_index :annotation_groups, :group_id, :name => 'index_annotation_group'

    remove_column :annotations, :group_id
  end

  def self.down
    remove_index :annotation_groups, :name => 'index_annotation_group'
    drop_table :annotation_groups

    add_column :annotations, :group_id, :integer
    add_index :annotations, :group_id, :name=>'index_annotation_group'
  end
end
