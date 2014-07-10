class AddDeCompleteFields < ActiveRecord::Migration
  def change
    add_column :documents, :de_one_complete, :boolean
    add_column :documents, :de_two_complete, :boolean
  end
end
