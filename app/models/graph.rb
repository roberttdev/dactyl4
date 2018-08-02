class Graph < ActiveRecord::Base

    include DC::DocumentStatus

    belongs_to :document
    belongs_to :group
    belongs_to :highlight

    belongs_to :clone_of, :class_name => "Graph", :foreign_key => 'based_on'
    has_one :qc_clone, :class_name => "Graph", :foreign_key => 'based_on'

    before_destroy :clear_highlights


    def approved()
        if document.status == STATUS_IN_QC then
            return !qc_clone.nil? || !clone_of.nil?
        end
    end

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
            'approved'            => approved,
            'based_on'            => based_on,
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

        grph_clone
    end


    def add_measurement_clone(meas_grp_id, new_acct_id, new_iteration)
        meas_grp = Group.find(meas_grp_id)
        my_json = JSON.parse(self.graph_json)
        to_pointJSON = my_json['wpd']['dataSeries'][0]
        from_pointJSON = JSON.parse(meas_grp.parent.graph.graph_json)['wpd']['dataSeries'][0]
        fieldmap = [] #index=from, value=to

        #Create mapping from one set of fields to the other.  Error if a field fails to map
        for i in 0..from_pointJSON['variableNames'].length - 1
            fieldmap[i] = self.get_var_name_index(from_pointJSON['variableNames'][i], to_pointJSON)
            if fieldmap[i] == -1 then
                return {
                    'errorText' => 'Approval failed because the target graph does not contain the same fields as the source graph.',
                    'data' => {}
                }
            end
        end

        #Grab data to copy; rearrange if necessary
        dataToCopy = from_pointJSON['data'][find_data_index(meas_grp, from_pointJSON)]
        adjustedValues = []
        adjustedExtras = []
        for i in 0..dataToCopy['value'].length - 1
            adjustedValues[fieldmap[i]] = dataToCopy['value'][i]
            if fieldmap[i] > 1 then
                adjustedExtras[fieldmap[i] - 2] = dataToCopy['value'][i]
            end
        end
        dataToCopy['value'] = adjustedValues
        dataToCopy['extraVars'] = adjustedExtras

        to_pointJSON['data'].push(dataToCopy)
        self.update({graph_json: JSON.generate(my_json)})
        grp_clone = meas_grp.clone(self.group_id, new_acct_id, false, true, new_iteration, true, true, true)
    end


    def remove_measurement(meas_grp_id)
        meas_grp = Group.find(meas_grp_id)
        my_json = JSON.parse(self.graph_json)
        json_data = my_json['wpd']['dataSeries'][0]
        json_data['data'].delete_at(self.find_data_index(meas_grp, json_data))
        self.update({graph_json: JSON.generate(my_json)})
    end


    #Return index of JSON data that matches the measurement group passed in
    def find_data_index(meas_grp, json_data)
        annos = meas_grp.annotations

        firstAnnoIndex = get_var_name_index(annos[0].title, json_data)

        for i in 0..(json_data['data'].length - 1)
            point = json_data['data'][i]
            if point['value'][firstAnnoIndex].to_s == annos[0].content then
                #If one matches, try matching all
                all_match = true
                for j in 1..(annos.length - 1)
                    if annos[j].content != point['value'][get_var_name_index(annos[j].title, json_data)].to_s then
                        all_match = false
                    end
                end
                if all_match then
                    return i
                end
            end
        end

        return -1
    end


    #Return index of JSON data that matches passed-in variable name
    def get_var_name_index(var_name, json_data)
        for i in 0..(json_data['variableNames'].length - 1)
            if json_data['variableNames'][i] == var_name then
                return i
            end
        end
        return -1
    end
end