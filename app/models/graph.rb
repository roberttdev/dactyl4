class Graph < ActiveRecord::Base
  belongs_to :document

  has_many :graph_groups, :dependent => :destroy
  has_many :groups, through: :graph_groups

  #Represent graph in annotation view (DV)
  def anno_view_json
    graph_group = graph_groups[0]

    {
        'document_id'         => document_id,
        'account_id'          => account_id,
        'page'                => page_number,
        'location'            => {'image' => location},
        'ag_account_id'       => graph_group.created_by,
        'iteration'           => iteration,
        'ag_iteration'        => graph_group.iteration,
        'annotation_group_id' => graph_group.id,
        'is_graph_data'       => true,
        'graph_json'          => graph_json,
        'anno_type'           => 'graph',
        'groups'              => [{:group_id => graph_group.group_id}]
    }
  end
end