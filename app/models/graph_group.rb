class GraphGroup < ActiveRecord::Base
  belongs_to :graph
  belongs_to :group

  after_destroy {
    #Destroy graph as well if no other groups link to it
    if !GraphGroup.exists?({graph_id: self.graph_id})
      Graph.destroy(self.graph_id)
    end
  }
end