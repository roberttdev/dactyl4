class SeparateHighlight < ActiveRecord::Migration
  def change
    create_table :highlights do |t|
      t.integer :document_id
      t.text :location
      t.integer :page_number
    end

    drop_table :annotation_groups do |t|
      t.integer :annotation_id
      t.integer :group_id
      t.integer :created_by
      t.integer :iteration
      t.integer :qa_approved_by
    end

    drop_table :graph_groups do |t|
      t.integer :graph_id
      t.integer :group_id
      t.integer :created_by
      t.integer :iteration
    end

    add_column :annotations, :highlight_id, :integer
    add_column :annotations, :group_id, :integer
    add_column :annotations, :created_by, :integer
    add_column :annotations, :qc_approved_by, :integer
    add_column :annotations, :qa_approved_by, :integer
    add_column :annotation_notes, :annotation_id, :integer
    remove_column :annotations, :page_number, :integer
    remove_column :annotations, :location, :text
    remove_column :annotation_notes, :annotation_group_id, :integer

    add_column :graphs, :highlight_id, :integer
    add_column :graphs, :group_id, :integer
    add_column :graphs, :created_by, :integer
    remove_column :graphs, :page_number, :integer
    remove_column :graphs, :location, :text
  end
end
