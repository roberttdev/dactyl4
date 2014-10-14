class AddQaReviewNote < ActiveRecord::Migration
  def change
    add_column :reviews, :qa_note, :text
  end
end
