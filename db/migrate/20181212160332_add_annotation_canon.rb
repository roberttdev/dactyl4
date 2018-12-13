class AddAnnotationCanon < ActiveRecord::Migration
  def change
    add_column :annotations, :canon, :boolean
  end
end
