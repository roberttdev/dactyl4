# The TemplatesController is responsible for managing templates and their fields.
class ExtractionController < ApplicationController
  layout 'workspace'

  before_filter :secure_only, :only => [:enable, :reset]
  before_filter :login_required, :except => [:enable, :reset, :logged_in]
  before_filter :bouncer, :only => [:enable, :reset] if Rails.env.staging?

  #The index is a simple listing of templates.
  def index
    if current_account.can_extract?
      respond_to do |format|
        format.html do
          if logged_in?
            if current_account.real?
              return render :layout => 'workspace'
            else
              return redirect_to '/public/search'
            end
          end
          redirect_to '/home'
        end

        format.json do
          if params[:subtemplates] == 'true'
            #Include subtemplates
            json GroupTemplate.includes(:subtemplates).all().to_json(:include => :subtemplates)
          else
            json GroupTemplate.all()
          end
        end
      end
    else
      return redirect_to '/public/search'
    end
  end


  # Does the current request come from a logged-in account?
  def logged_in
    return bad_request unless request.format.json? or request.format.js?
    @response = {:logged_in => logged_in?}
    json_response
  end


  # Pull a specific template
  def show
    json GroupTemplate.find(params[:id])
  end


  # Create new template
  def create
    template_attributes = pick(params, :name, :parent_id)
    json GroupTemplate.create(template_attributes)
  end


  # Update template
  def update
    template = GroupTemplate.find(params[:id])
    unless template.update_attributes pick(params, :name)
      return json({ "errors" => template.errors.to_a.map{ |field, error| "#{field} #{error}" } }, 409)
    end

    json({"success" => true})
  end


  # Delete template
  def destroy
    template = GroupTemplate.find(params[:id])
    template.destroy()
    json({"success" => true})
  end

end
