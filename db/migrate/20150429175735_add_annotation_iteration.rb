class AddAnnotationIteration < ActiveRecord::Migration
  def change
    add_column :annotations, :iteration, :integer
  end
end
