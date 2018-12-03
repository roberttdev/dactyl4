class RemoveDeRef < ActiveRecord::Migration
  def change
      remove_column :annotation_notes, :de_ref, :integer
  end
end
