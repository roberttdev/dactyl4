class AddCanonGroup < ActiveRecord::Migration
  def change
    add_column :groups, :canon, :boolean
  end
end
