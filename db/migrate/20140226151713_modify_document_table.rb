class ModifyDocumentTable < ActiveRecord::Migration
  def self.up
    add_column :documents, :study, :text
    add_column :documents, :status, :integer
    add_column :documents, :de_one_id, :integer
    add_column :documents, :de_two_id, :integer
    add_column :documents, :qc_id, :integer
    add_column :documents, :qa_id, :integer

    add_index :documents, :status, :name=>'index_status'
  end

  def self.down
    remove_column :documents, :study, :text
    remove_column :documents, :status
    remove_column :documents, :de_one_id
    remove_column :documents, :de_two_id
    remove_column :documents, :qc_id
    remove_column :documents, :qa_id

    remove_index :documents, :name=>'index_status'
  end
end
