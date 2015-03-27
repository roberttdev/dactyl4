class CreateViewOnlyAccesses < ActiveRecord::Migration
  def change
    create_table :view_only_accesses do |t|
      t.integer :document_id
      t.integer :account_id
      t.timestamps
    end
  end
end
