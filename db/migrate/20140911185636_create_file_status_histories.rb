class CreateFileStatusHistories < ActiveRecord::Migration
  def change
    create_table :file_status_histories do |t|
      t.integer :status, :null => false
      t.integer :user, :null => false
      t.timestamps
    end
  end
end
