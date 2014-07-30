class AnnotationApprovals < ActiveRecord::Migration
  def change
    add_column :annotations, :qc_approved, :boolean
    add_column :annotations, :qa_approved, :boolean
  end
end
