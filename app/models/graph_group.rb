class GraphGroup < ActiveRecord::Base
  has_one :graph
  has_one :group

  after_destroy {
    #Destroy graph as well if no other groups link to it
    if !GraphGroup.exists?({graph_id: self.graph_id})
      Graph.destroy_all({id: self.graph_id})
    end
  }
end