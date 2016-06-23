# The TemplatesController is responsible for managing templates and their fields.
class ExtractionController < ApplicationController
  require 'zip'

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
      vo_acct = Account.by_name(vo_name[1].strip, vo_name[0].strip).first
      return json 'View-Only Account not found.  Please try again.', 500 if !vo_acct || !vo_acct.view_only?
    end
    vo_id = vo_acct ? vo_acct.id : nil

    if params[:file_format] == 'csv'
      resultFile = Extraction.new.assemble_csv_from_query(params[:endpoints], params[:filters], vo_id, params[:repository_id] )
    else
      resultFile = Extraction.new.assemble_json_from_query(params[:endpoints], params[:filters], vo_id, params[:repository_id] )
    end

    #If VO account passed, generate config file and ZIP contents
    if vo_acct
      time = Time.new()
      config_file = "/extraction/#{time.year}#{time.month}#{time.day}#{time.hour}#{time.min}#{time.sec}#{time.usec}.config"
      File.open("public#{config_file}", "w") do |file|
        file.puts "Login URL: #{request.base_url}/view-only-login?id=#{vo_acct.id}&p=#{vo_acct.hashed_password}"
        file.puts "Created On: #{time.year}-#{time.month}-#{time.day} #{time.hour}:#{time.min}:#{time.sec}"
      end

      zip_file = "/extraction/#{time.year}#{time.month}#{time.day}#{time.hour}#{time.min}#{time.sec}#{time.usec}.zip"
      Zip::File.open("public#{zip_file}", Zip::File::CREATE) do |zipfile|
        if params[:file_format] == 'csv'
          zipfile.add("data.csv", "public#{resultFile[0]}")
          zipfile.add("ids.csv", "public#{resultFile[1]}")
        else
          zipfile.add("data.json", "public#{resultFile[0]}")
        end

        zipfile.add("README", "public#{config_file}")
      end
      File.chmod(0644, "public#{zip_file}")

      resultFile = zip_file
    end

    @response = {:filename => resultFile}
    json_response
  end


end
