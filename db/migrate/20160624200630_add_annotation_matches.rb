class AddAnnotationMatches < ActiveRecord::Migration
  def change
    add_column :annotations, :match_id, :integer
    add_column :annotations, :match_strength, :integer
  end
end
