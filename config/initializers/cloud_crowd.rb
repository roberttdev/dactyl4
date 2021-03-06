# Running in the console? 
# Here's direct access to the CloudCrowd database.
if defined? Rails::Console
  ENV['RAILS_ENV'] ||= (Rails.env || 'development')

  CloudCrowd.configure("./config/cloud_crowd/#{Rails.env}/config.yml")

  [CloudCrowd::Job, CloudCrowd::WorkUnit, CloudCrowd::NodeRecord].each do |klass|
    klass.class_eval do
      config_path = "./config/cloud_crowd/#{Rails.env}/database.yml"
      configuration = YAML.load(ERB.new(File.read(config_path)).result)
      self.establish_connection(configuration)
    end
  end

  include CloudCrowd
end