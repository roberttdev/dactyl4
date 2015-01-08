class GroupsController < ApplicationController

  def index
    #Pull base-level groups/annotations and create group-like JSON
    doc = Document.find(params[:document_id])
    group = Group.includes(:children, :group_template).base(doc, current_account.id, params[:de], params[:qc])

    responseJSON = group.as_json({
      include: [:children, :group_template],
      ancestry: true
    })

    responseJSON[:annotations] = Annotation.flattened_by_group(group.id).as_json()

    json responseJSON
  end

  def show
    #Pull base-level groups/annotations and create group-like JSON
    doc = Document.find(params[:document_id])
    responseJSON = Group.includes(:children, :group_template).find(params[:id]).as_json({
                      include: [:children, :group_template],
                      ancestry: true
                  })
    responseJSON[:annotations] = Annotation.flattened_by_group(params[:id]).as_json()
    json responseJSON
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
          :title        => field.field_name,
          :templated    => true
        })

        ag = AnnotationGroup.create({
          :annotation_id  => anno.id,
          :group_id       => group.id,
          :created_by     => current_account.id,
          :approved_count => 0,
          :iteration      => doc.iteration
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
    json to_clone.clone(params[:parent_id], current_account.id, false, !doc.in_qc?, doc.iteration, doc.in_qc?)
  end

  def update_approval
    group = Group.find(params[:id])
    group.update_qa_status(params[:approved], params[:qa_reject_note], current_account.id)

    json({"success" => true})
  end
end
