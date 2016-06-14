# The RepositoriesController is responsible for managing repositories
class RepositoriesController < ApplicationController
  layout 'workspace'

  before_filter :secure_only, :only => [:enable, :reset]
  before_filter :login_required, :except => [:enable, :reset, :logged_in]

  #The index is a simple listing of templates.
  def index
    if current_account.admin?
      respond_to do |format|
        format.html do
          if logged_in?
              return render :layout => 'workspace'
          end
          redirect_to '/home'
        end

        format.json do
            json Repository.all()
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
    json Repository.find(params[:id])
  end


  # Create new template
  def create
    json Repository.create(pick(params, :repo_name))
  end


  # Update template
  def update
    repo = Repository.find(params[:id])
    unless repo.update_attributes pick(params, :repo_name)
      return json({ "errors" => repo.errors.to_a.map{ |field, error| "#{field} #{error}" } }, 409)
    end

    json({"success" => true})
  end


  # Delete template
  def destroy
    repo = Repository.find(params[:id])
    repo.destroy()
    json({"success" => true})
  end


end
