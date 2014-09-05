class AddQaNoteToAnnotation < ActiveRecord::Migration
  def change
    add_column :annotations, :qa_note, :text
  end
end
