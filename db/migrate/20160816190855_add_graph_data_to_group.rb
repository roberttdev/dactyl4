class AddGraphDataToGroup < ActiveRecord::Migration
  def change
    add_column :groups, :graph_json, :string
    add_column :groups, :location, :string
    add_column :groups, :image_link, :string
  end
end
