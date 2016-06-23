class AddRepositoryToDocument < ActiveRecord::Migration
  def change
    add_column :documents, :repository_id, :integer
  end
end
