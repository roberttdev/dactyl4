class GroupsController < ApplicationController
  include DC::DocumentStatus

  def index
    #Pull base-level groups/annotations and create group-like JSON
    doc = Document.find(params[:document_id])
    if( doc.status == STATUS_DE1 || doc.status == STATUS_DE2 )
      #When in DE, return only current user's data
      responseJSON = ActiveSupport::JSON.encode({
        document_id: doc.id,
        children: Group.where({
            :document_id => params[:document_id],
            :account_id => current_account.id,
            :parent_id => nil
        }),
        annotations: Annotation.includes(:groups).where({
            :document_id => params[:document_id],
            :account_id => current_account.id,
            "groups.id" => nil
        })
      })
    end
    json responseJSON
  end

  def show
    responseJSON = Group.includes(:children, :group_template).find(params[:id]).as_json({include: [:children, :group_template], ancestry: true})
    responseJSON[:annotations] = Annotation.includes(:groups).where({:document_id => params[:document_id], 'groups.id' => params[:id]})
    json responseJSON
  end

  def create
    #Figure out which template id to use and then create group
    group_attributes = pick(params, :name, :parent_id, :document_id, :extension)
    templateId = (params[:template_id] == "0" ? nil : params[:template_id])
    subtemplateId = (params[:subtemplate_id] == "0" ? nil : params[:subtemplate_id])
    group_attributes[:template_id] = templateId
    group_attributes[:account_id] = current_account.id
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
        anno = Annotation.create({
            :account_id   => current_account.id,
            :document_id  => params[:document_id],
            :title        => field.field_name,
            :templated    => true
        })
        anno.groups << group
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
    unless group.update_attributes pick(params, :name, :extension)
      return json({ "errors" => template.errors.to_a.map{ |field, error| "#{field} #{error}" } }, 409)
    end

    json({"success" => true})
  end

  def clone
    to_clone = Group.find(params[:group_id])
    json to_clone.clone(to_clone.parent_id, false)
  end
end
