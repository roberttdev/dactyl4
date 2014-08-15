class GroupsController < ApplicationController

  def index
    #Pull base-level groups/annotations and create group-like JSON
    doc = Document.find(params[:document_id])

    if doc.in_de?
        accountId = current_account.id
    end
    if doc.in_qc?
        accountId = doc.de_one_id if params[:de] == "1"
        accountId = doc.de_two_id if params[:de] == "2"
        accountId = doc.qc_id if params[:qc] == "true"
    end

    group = Group.includes(:children, :group_template)
      .where({
        :document_id => params[:document_id],
        :account_id => accountId,
        :base => true
      }).first

    responseJSON = group.as_json({
                    include: [:children, :group_template],
                    ancestry: true
                  })

    responseJSON[:annotations] = Annotation.includes(:groups)
      .where({
        :document_id => params[:document_id],
        'groups.id' => group.id
      })

    json responseJSON
  end

  def show
    #Pull base-level groups/annotations and create group-like JSON
    doc = Document.find(params[:document_id])
    responseJSON = Group.includes(:children, :group_template).find(params[:id]).as_json({
                      include: [:children, :group_template],
                      ancestry: true
                  })
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

    doc = Document.find(params[:document_id])

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
