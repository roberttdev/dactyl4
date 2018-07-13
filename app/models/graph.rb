class Graph < ActiveRecord::Base
    belongs_to :document
    belongs_to :group
    belongs_to :highlight

    has_one :qc_clone, :class_name => "Graph", :foreign_key => 'based_on'

    before_destroy :clear_highlights


    def self.create(params)
        if params[:highlight_id].nil? && !params[:location].nil? then
            highlight = Highlight.create({
                                       :document_id => params[:document_id],
                                       :image_link => params[:image_link],
                                       :location => params[:location],
                                       :page_number => params[:page_number]
                                   })
            params[:highlight_id] = highlight.id
        end

        params = params.except(:image_link,:location,:page_number)
        super(params)
    end


    def clear_highlights
        #If this is the last object attached to a highlight, delete it
        if self.highlight and self.highlight.annotations.length == 0 and self.highlight.graphs.length == 1 then
            self.highlight.destroy
        end
    end


    def as_json(opts={})
        {
            'account_id'          => account_id,
            'approved'            => !qc_clone.nil?,
            'document_id'         => document_id,
            'graph_json'          => graph_json,
            'group_id'            => group_id,
            'highlight_id'        => highlight_id,
            'id'                  => id,
            'image_link'          => self.highlight ? self.highlight.image_link : nil,
            'iteration'           => iteration,
            'location'            => self.highlight ? self.highlight.location : nil,
            'owns_note'           => opts[:account] && (opts[:account].id == account_id) && (iteration == document.iteration)
        }
    end


    def clone(parent_id, new_acct_id, new_iteration)
        grp_clone = self.group.clone(parent_id, new_acct_id, false, true, new_iteration, true, true, true)
        grph_clone = Graph.create({
             'account_id'          => new_acct_id,
             'based_on'            => self.id,
             'created_by'          => new_acct_id,
             'document_id'         => document_id,
             'graph_json'          => graph_json,
             'group_id'            => grp_clone.id,
             'highlight_id'        => highlight_id,
             'iteration'           => new_iteration
        })

        grp_clone
    end


    def add_measurement_clone(meas_grp_id, new_acct_id, new_iteration)
        meas_grp = Group.find(meas_grp_id)
        to_pointJSON = JSON.parse(self.graph_json)['wpd']['dataSeries'][0]
        from_pointJSON = JSON.parse(meas_grp.parent.graph.graph_json)['wpd']['dataSeries'][0]
        self
    end
end