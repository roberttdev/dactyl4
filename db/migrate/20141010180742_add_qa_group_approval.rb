class AddQaGroupApproval < ActiveRecord::Migration
  def change
    add_column :groups, :qa_approved_by, :integer
    add_column :annotation_notes, :group_id, :integer
  end
end
