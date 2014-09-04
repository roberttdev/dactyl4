class AddQcCompleteDataToDocument < ActiveRecord::Migration
  def change
    add_column :documents, :de_one_rating, :integer
    add_column :documents, :de_two_rating, :integer
    add_column :documents, :qc_note, :text
  end
end
