# The TemplatesController is responsible for managing templates and their fields.
class ExtractionController < ApplicationController
  layout 'workspace'

  before_filter :login_required, :except => [:enable, :reset, :logged_in]

  #The index is a simple listing of templates.
  def index
    if current_account.can_extract?
      respond_to do |format|
        format.html do
          if logged_in?
              return render :layout => 'workspace'
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


  # Create new extraction.  Takes parameters:
  # account_name: (optional) "Last Name, First Name" to grant access of results to
  # filters: (optional) Hash, of format {col_name1: [val1, val2..]} to filter doc lookup by
  # endpoint: String representing name of column forming rightmost column of resulting table
  def create
    #Turn username into ID
    if params[:account_name] && params[:account_name].length > 0
      vo_name = params[:account_name].split(",")
      vo_acct = Account.by_name(vo_name[1].strip, vo_name[0].strip)
      return json 'Account not found.  Please try again.', 500 if !vo_acct.exists?
    end
    vo_id = vo_acct ? vo_acct.id : nil

    if params[:file_format] == 'csv'
      resultFile = Extraction.new.assemble_csv_from_query(params[:endpoints], params[:filters], vo_id ).filename
    else
      resultFile = Extraction.new.assemble_json_from_query(params[:endpoints], params[:filters], vo_id ).filename
    end
  end


end
