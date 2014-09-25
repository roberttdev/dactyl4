class CreateAnnotationNotes < ActiveRecord::Migration
  def change
    remove_column :annotation_groups, :qa_reject_note, :text

    create_table :annotation_notes do |t|
      t.integer :document_id
      t.integer :annotation_group_id
      t.text :note
      t.boolean :addressed
      t.timestamps
    end
  end
end
