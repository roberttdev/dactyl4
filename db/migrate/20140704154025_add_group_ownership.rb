class AddGroupOwnership < ActiveRecord::Migration
  def change
    add_column :groups, :account_id, :integer
  end
end
