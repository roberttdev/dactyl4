class CreateGraphData < ActiveRecord::Migration
  def change
    create_table :graphs do |t|
      t.text :location
    end

    create_table :graph_groups do |t|
      t.integer :graph_id
      t.integer :group_id
      t.text    :graph_json
    end

    add_column :groups, :is_graph_data, :boolean
    add_column :annotations, :is_graph_data, :boolean
  end
end
