class AddDisabledFlagToAccount < ActiveRecord::Migration
  def change
    add_column :accounts, :disabled, :boolean
  end
end
