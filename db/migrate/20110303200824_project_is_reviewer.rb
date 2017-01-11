class ProjectIsReviewer < ActiveRecord::Migration
  def self.up
    projects = Project.where("reviewer_document_id IS NOT NULL")
    add_column :projects, :hidden, :boolean, :default => false, :null => false
    projects.each {|p| p.update_attributes :hidden => true }
    remove_column :projects, :reviewer_document_id
  end

  def self.down
    remove_column :projects, :hidden
    add_column :projects, :reviewer_document_id, :integer
  end
end
