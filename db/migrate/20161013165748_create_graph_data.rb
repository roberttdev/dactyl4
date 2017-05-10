class CreateGraphData < ActiveRecord::Migration
  def change
    create_table :graphs do |t|
      t.integer :document_id
      t.text :location
      t.text :graph_json
      t.integer :page_number
      t.integer :iteration
      t.integer :account_id
    end

    create_table :graph_groups do |t|
      t.integer :graph_id
      t.integer :group_id
      t.integer :iteration
      t.integer :created_by
    end

    add_column :groups, :is_graph_data, :boolean
    add_column :annotations, :is_graph_data, :boolean
  end
end
