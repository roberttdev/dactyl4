class GroupsController < ApplicationController
  def index
    #Pull base-level groups/annotations and create group-like JSON
    responseJSON = ActiveSupport::JSON.encode({
        document_id: params[:document_id],
        children: Group.where({:document_id => params[:document_id], :parent_id => nil}),
        annotations: Annotation.where({:document_id => params[:document_id], :group_id => nil})
    })
    json responseJSON
  end

  def show
    json Group.includes(:children, :annotations, :group_template).find(params[:id]).as_json({include: [:children, :annotations, :group_template], ancestry: true})
  end

  def create
    #Figure out which template id to use and then create group
    group_attributes = pick(params, :name, :parent_id, :document_id)
    templateId = (params[:template_id] == "0" ? nil : params[:template_id])
    subtemplateId = (params[:subtemplate_id] == "0" ? nil : params[:subtemplate_id])
    group_attributes[:template_id] = templateId
    group = Group.create(group_attributes)

    #If a template was used, create the attributes
    if group.template_id != nil
      if subtemplateId != nil
        template_fields = TemplateField.includes(:subtemplate_fields).where("subtemplate_fields.subtemplate_id=#{subtemplateId}").references(:subtemplate_fields)
      else
        template_fields = TemplateField.where(template_id: templateId)
      end

      template_fields.each do |field|
        #Leaving this code here in case cache needs expiring later
        #doc = current_document
        #expire_page doc.canonical_cache_path if doc.cacheable?
        Annotation.create({
            :account_id   => current_account.id,
            :document_id  => params[:document_id],
            :title        => field.field_name,
            :group_id     => group.id,
            :templated    => true
        })
      end
    end

    json group
  end

  def destroy
    group = Group.find(params[:id])
    group.destroy()
    json({"success" => true})
  end

  def update
    group = Group.find(params[:id])
    unless group.update_attributes pick(params, :name)
      return json({ "errors" => template.errors.to_a.map{ |field, error| "#{field} #{error}" } }, 409)
    end

    json({"success" => true})
  end
end
