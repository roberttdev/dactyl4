class CreateNewQcStructure < ActiveRecord::Migration
  def change
    add_column    :annotations, :based_on, :integer

    add_column :graphs, :based_on, :integer
    add_column :graphs, :qa_by, :integer
  end
end
