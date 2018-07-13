class GroupsController < ApplicationController

    def index
        json get_group_json(params, true)
    end


    def show
        json get_group_json(params, false)
    end


  #Fetch group JSON based on parameters.  BASE determines whether to pull base group, or use group ID from parameters
    def get_group_json( params, base )
        doc = Document.find(params[:document_id])
        includes = self.determine_child_includes(doc, params)

        if base
            grp = Group.includes(includes).base(doc, current_account.id, params[:de], params[:qc])
        else
            grp = Group.includes(includes).find(params[:id])
        end

        responseJSON = grp.as_json({
                         include: includes,
                         ancestry: true
                       })

        if (doc.in_de? || doc.in_supp_de?) && grp.template_id
            responseJSON[:template_fields] = TemplateField.where({template_id: grp.template_id}).pluck(:field_name)
        end

        responseJSON[:annotations] = Annotation.by_doc_status(doc, params[:de]).where(:group_id => grp.id).as_json()
        responseJSON
    end


    def create
        doc = Document.find(params[:document_id])

        #Figure out which template id to use and then create group
        group_attributes = pick(params, :name, :parent_id, :document_id, :extension)
        templateId = (params[:template_id] == "0" ? nil : params[:template_id])
        subtemplateId = (params[:subtemplate_id] == "0" ? nil : params[:subtemplate_id])
        group_attributes[:template_id] = templateId
        group_attributes[:account_id] = current_account.id
        group_attributes[:iteration] = doc.iteration

        #If parent group is a part of a graph, make this group graph-related as well
        if !group_attributes[:parent_id].nil?
            parent = Group.find(group_attributes[:parent_id])
            if parent.is_graph_group || parent.is_graph_data
                group_attributes[:is_graph_data] = true
            end
        end

        group = Group.create(group_attributes)

        #If a template was used and we are in DE, create the attributes
        if group.template_id != nil && doc.in_de?
            if subtemplateId != nil
                template_fields = TemplateField.includes(:subtemplate_fields).where("subtemplate_fields.subtemplate_id=#{subtemplateId}").references(:subtemplate_fields)
            else
                template_fields = TemplateField.where(template_id: templateId)
            end

            template_fields.each do |field|
                #Leaving this code here in case cache needs expiring later
                #doc = current_document
                #expire_page doc.canonical_cache_path if doc.cacheable?
                anno = Annotation.create({
                    :account_id   => current_account.id,
                    :document_id  => params[:document_id],
                    :group_id     => group.id,
                    :iteration    => doc.iteration,
                    :templated    => true,
                    :title        => field.field_name
                })
            end
        end

        json group
    end


    def destroy
        group = Group.find(params[:id])
        doc = Document.find(group.document_id)

        doc.in_supp_de? ? group.mark_deleted_in_supp() : group.destroy()

        json({"success" => true})
    end


    def update
        group = Group.find(params[:id])
        doc = Document.find(group.document_id)
        submitHash = pick(params, :name, :extension)
        submitHash[:qa_approved_by] = current_account.id if doc.in_extraction?

        unless group.update_attributes submitHash
            return json({ "errors" => template.errors.to_a.map{ |field, error| "#{field} #{error}" } }, 409)
        end

        json({"success" => true})
    end


    def clone
        to_clone = Group.find(params[:group_id])
        doc = Document.find(to_clone.document_id)
        in_qc = doc.in_qc? || doc.in_supp_qc?
        json to_clone.clone(params[:parent_id], current_account.id, false, !in_qc, doc.iteration, in_qc, false, false)
    end


    #Currently only used for QC clones
    def graph_clone
        to_clone = Graph.where({:group_id => params[:group_id]}).first

        if(to_clone)
            #If graph attached, this is base graph group.. clone entire graph
            doc = Document.find(to_clone.document_id)
            json to_clone.clone(params[:parent_id], current_account.id, doc.iteration)
        else
            #If no graph attached to group, this is subgroup graph data.  Add to parent
            par_graph = Graph.where({:group_id => params[:parent_id]}).first
            doc = Document.find(par_graph.document_id)
            json par_graph.add_measurement_clone(params[:group_id], current_account.id, doc.iteration)
        end
    end


    def import_graph_data
        doc = Document.find(params[:document_id])
        parent_group = Group.find(params[:group_id])

        #If graph data already exists, wipe it and replace
        Group.destroy_all({:parent_id => parent_group.id, :is_graph_data => true})

        graph = Graph.create({
            :account_id => current_account.id,
            :created_by => current_account.id,
            :document_id => doc.id,
            :graph_json => params[:graph_json],
            :group_id => params[:group_id],
            :highlight_id => params[:highlight_id],
            :image_link => params[:image_link],
            :iteration => doc.iteration,
            :location => params[:location],
            :page_number => params[:page_number]
        })

        graph_data = JSON.parse(params[:graph_json])
        variableIds = graph_data['wpd']['dataSeries'][0]['variableIds']
        graphPoints = graph_data['wpd']['dataSeries'][0]['data']
        variableNames = []

        for i in 0..(variableIds.length-1)
            variableNames[i] = TemplateField.find(variableIds[i]).field_name
        end

        graphPoints.each do |point|
            group = Group.create({
                :template_id => 1,
                :parent_id => parent_group.id,
                :document_id => doc.id,
                :account_id => current_account.id,
                :iteration => doc.iteration,
                :is_graph_data => true,
                :name => 'Measurement'
            })

            for i in 0..(point['value'].length-1)
                anno = Annotation.create({
                    :account_id => current_account.id,
                    :content => point['value'][i],
                    :document_id => doc.id,
                    :group_id => group.id,
                    :highlight_id => graph.highlight_id,
                    :is_graph_data => true,
                    :iteration => doc.iteration,
                    :templated => true,
                    :title => variableNames[i]
                })
            end
        end

        json(graph)
    end


    def update_approval
        group = Group.find(params[:id])
        group.update_qa_status(params[:approved], params[:qa_reject_note], current_account.id, params[:subitems_too])

        json({"success" => true})
    end

    def search
        searchTerm = params[:term] + '%'
        json Group.uniq.where("qa_approved_by IS NOT NULL AND name ILIKE ?", searchTerm )
               .order(:name).limit(10).pluck(:name)
    end


    def determine_child_includes(doc, params)
        #Determine what filter (if any) for children to use
        if params[:de] == '1' && doc.iteration > 1
            includes = [:supp_qc_de1_children, :group_template]
        elsif params[:de] == '2' && doc.iteration > 1
            includes = [:supp_qc_de2_children, :group_template]
        elsif params[:qc] && doc.iteration > 1
            includes = [:supp_qc_children, :group_template]
        elsif doc.in_supp_qa?
            includes = [:supp_qa_children]
        else
            includes = [:children, :group_template]
        end
    end


end
