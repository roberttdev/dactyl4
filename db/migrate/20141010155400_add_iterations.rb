class AddIterations < ActiveRecord::Migration
  def change
    #Add iteration info
    add_column :documents, :iteration, :integer
    add_column :groups, :iteration, :integer
    add_column :annotation_groups, :iteration, :integer

    #Add iteration and QA review info
    rename_table :qc_reviews, :reviews
    add_column :reviews, :qa_id, :integer
    add_column :reviews, :qc_rating, :integer
    add_column :reviews, :iteration, :integer
  end
end
