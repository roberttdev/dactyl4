class SubtemplatesController < ApplicationController
  def index
  end

  def show
  end


  def create
    template_attributes = pick(params, :sub_name, :template_id)
    json Subtemplate.create(template_attributes)
  end


  def update
    template = Subtemplate.find(params[:id])
    unless template.update_attributes pick(params, :sub_name, :template_id)
      return json({ "errors" => template.errors.to_a.map{ |field, error| "#{field} #{error}" } }, 409)
    end

    json({"success" => true})
  end


  def destroy
    template = Subtemplate.find(params[:id])
    template.destroy()
    json({"success" => true})
  end

end
