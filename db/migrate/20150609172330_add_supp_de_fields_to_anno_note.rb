class AddSuppDeFieldsToAnnoNote < ActiveRecord::Migration
  def change
    add_column :annotation_notes, :iteration, :integer
    add_column :annotation_notes, :de_ref, :integer
  end
end
