class RemoveNotNullsFromAnnotation < ActiveRecord::Migration
  def up
    change_column :annotations, :organization_id, :int, :null=> true
    change_column :annotations, :page_number, :int,  :null=> true
    change_column :annotations, :access, :int,  :null => true
  end

  def down
    change_column :annotations, :organization_id, :int, :null=> false
    change_column :annotations, :page_number, :int, :null=> false
    change_column :annotations, :access, :int, :null => false
  end
end
