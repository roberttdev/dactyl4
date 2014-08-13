class AddBaseGroup < ActiveRecord::Migration
  def change
    add_column :groups, :base, :boolean, :default => false
  end
end
