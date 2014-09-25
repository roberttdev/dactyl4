class AddQaFileNote < ActiveRecord::Migration
  def change
    add_column :documents, :qa_note, :text
  end
end
