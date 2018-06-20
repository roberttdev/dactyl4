class AddImageLinkToHighlight < ActiveRecord::Migration
  def change
      add_column :highlights, :image_link, :text
  end
end
