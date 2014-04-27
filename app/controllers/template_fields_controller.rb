class TemplateFieldsController < ApplicationController
  def index
    json TemplateField.where('template_id' => params[:template_id])
  end

  def create
  end

  def destroy
    template = TemplateField.find(params[:id])
    template.destroy()
    json({:success => 'true'})
  end

  def update
  end

  def bulk_update
    params[:bulkData].each do |field|
      if field[:id].nil?
        TemplateField.create(pick(field, :field_name, :template_id))
      else
       TemplateField.update(field[:id], {
          :field_name => field[:field_name],
          :template_id => params[:template_id]
        })
      end
    end
    json TemplateField.where('template_id' => params[:template_id])
  end
end
