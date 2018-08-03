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

        data['annotations'] = get_canonical_annotations.map {|a| a.canonical(opts)}
        data['graphs'] = get_canonical_graphs.map {|g| g.as_json(opts) }

        data
    end


    def get_canonical_annotations()
        whereClause = "(is_graph_data IS NULL OR is_graph_data=FALSE)"
        whereClause += " AND based_on IS NULL" if document.in_qc?
        whereClause += " AND based_on IS NOT NULL" if document.in_qa?
        annotations.where(whereClause)
    end


    def get_canonical_graphs()
        whereClause = ""
        whereClause += " based_on IS NOT NULL" if document.in_qa?
        graphs.where(whereClause)
    end
end