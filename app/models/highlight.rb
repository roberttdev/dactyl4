class Highlight < ActiveRecord::Base
  belongs_to :document

  has_many :annotations
  has_many :graphs

  def canonical(opts={})
    data = {'id' => id, 'page' => page_number}
    data['image_link'] = image_link
    data['location'] = location
    data['image_url'] = document.page_image_url_template if opts[:include_image_url]
    data['published_url'] = document.published_url || document.document_viewer_url(:allow_ssl => true) if opts[:include_document_url]

    data['annotations'] = annotations.where("(is_graph_data IS NULL OR is_graph_data=FALSE)").map {|a| a.canonical(opts)}
    data['graphs'] = graphs.map {|g| g.as_json() }

    data
  end
end