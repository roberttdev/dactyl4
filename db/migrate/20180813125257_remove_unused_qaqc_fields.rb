class RemoveUnusedQaqcFields < ActiveRecord::Migration
  def change
      remove_column :graphs, :qa_by, :integer
      remove_column :annotations, :qc_approved_by, :integer
      remove_column :annotations, :created_by, :integer
  end
end
