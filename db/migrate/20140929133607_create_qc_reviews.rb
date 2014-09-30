class CreateQcReviews < ActiveRecord::Migration
  def change
    remove_column :documents, :de_one_rating, :integer
    remove_column :documents, :de_two_rating, :integer
    remove_column :documents, :qc_note, :text

    create_table :qc_reviews do |t|
      t.integer :document_id
      t.integer :qc_id
      t.integer :de_one_id
      t.integer :de_one_rating
      t.integer :de_two_id
      t.integer :de_two_rating
      t.text    :qc_note
      t.timestamps
    end
  end
end
