# The ImageCropController takes a request to crop a page image, and handles creating a new file containing the
# cropped area.
class ImagecropController < ApplicationController
  layout 'workspace'

  # Create a new crop.  Expects image name, top-left x and y, height and weight (all 4 represented as a ratio)
  # of document's dimension
  def create
    # Check the requester's permissions
    return forbidden unless !current_account.nil?

    #Turn URI reference into filesystem path
    img_name = "#{Rails.root}/public#{URI(params[:img_name]).path}"

    # Get weight/height of image
    result = `gm identify -format "%w,%h" #{img_name} 2>&1`.chomp
    if $? != 0
      raise StandardError, result
    else
      dims = result.split(",")
    end

    #Calculate dimensions of crop
    width = (params[:w_ratio].to_f * dims[0].to_i).round
    height = (params[:h_ratio].to_f * dims[1].to_i).round
    x = (params[:x_ratio].to_f * dims[0].to_i).round
    y = (params[:y_ratio].to_f * dims[1].to_i).round

    #Calculate unique filename
    file_parts = img_name.split('-large')
    i = 1
    output_file = "#{file_parts[0]}-graph#{i}.jpg"
    while File.exist?(output_file)
      i = i + 1
      output_file = "#{file_parts[0]}-graph#{i}.jpg"
    end

    result = `gm convert -crop #{width}x#{height}+#{x}+#{y} #{img_name} #{output_file} 2>&1`
    if $? != 0
      raise StandardError, result
    else
      #Reappend output file to URL and return
      filename = output_file[output_file.rindex("/")..output_file.length]
      return_url = params[:img_name][0..params[:img_name].rindex("/") - 1]
      json({:filename => "#{return_url}#{filename}"})
    end

  end

end
