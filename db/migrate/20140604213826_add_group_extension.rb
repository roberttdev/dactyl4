class AddGroupExtension < ActiveRecord::Migration
  def self.up
    add_column :groups, :extension, :text
  end

  def self.down
    remove_column :groups, :extension, :text
  end
end
