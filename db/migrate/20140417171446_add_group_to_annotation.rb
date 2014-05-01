class AddGroupToAnnotation < ActiveRecord::Migration
  def self.up
    add_column :annotations, :group_id, :integer
    add_column :annotations, :templated, :boolean, :default => false

    add_index :annotations, :group_id, :name=>'index_annotation_group'
  end

  def self.down
    remove_index :annotations, :name=>'index_annotation_group'
    remove_column :annotations, :group_id
    remove_column :annotations, :templated
  end
end
