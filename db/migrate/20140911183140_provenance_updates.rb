class ProvenanceUpdates < ActiveRecord::Migration
  def change
    #Update provenance structure to move ID tracking from anno to anno_group, as well as creating status history table

    remove_column :annotations, :qc_approved, :boolean
    remove_column :annotations, :qa_approved, :boolean
    remove_column :annotations, :qa_note, :text

    add_column :annotation_groups, :created_by, :integer
    add_column :annotation_groups, :qa_approved_by, :integer
    add_column :annotation_groups, :qa_reject_note, :text
    add_column :annotation_groups, :based_on, :integer
    add_column :annotation_groups, :approved_count, :integer
  end
end
