namespace :app do

  task :start do
    sh "sudo /etc/init.d/nginx start"
  end

  task :devstart do
    sh "rake crowd:server:start && rake crowd:node:start && rake sunspot:solr:start && sudo nginx"
  end

  task :restart_solr do
    sh "rake #{RAILS_ENV} sunspot:solr:stop sunspot:solr:start"
  end

  task :stop do
    sh "sudo /etc/init.d/nginx stop"
  end

  task :restart do
    sh "touch tmp/restart.txt"
  end

  task :warm do
    secrets = YAML.load_file("#{Rails.root}/secrets/secrets.yml")[RAILS_ENV]
    sh "curl -s -u #{secrets['guest_username']}:#{secrets['guest_password']} http://localhost:80 > /dev/null"
  end

  task :console do
    exec "script/console #{RAILS_ENV}"
  end

  desc "Update the Rails application"
  task :update do
    sh 'git pull && bundle install'
    sleep 0.2
  end

  desc "Repackage static assets"
  task :jammit do
    config = YAML.load_file("#{Rails.root}/config/document_cloud.yml")[RAILS_ENV]
    sh "sudo su ubuntu -c \"jammit -u http://#{config['server_root']}\""
  end

  desc "Publish all documents with expired publish_at timestamps"
  task :publish => :environment do
    Document.publish_due_documents
  end

  namespace :clearcache do

    desc "Clears out cached document JS files."
    task :docs do
      sh 'find ./public/documents/ -maxdepth 1 -name "*.js" -delete'
      invoke 'app:clearcache:notes'
    end

    desc "Clears out cached annotation JS files."
    task :notes do
      sh 'find ./public/documents/*/annotations/ -maxdepth 1 -name "*.js" -delete'
    end

    desc "Purges cached search embeds."
    task :search do
      sh "rm -rf ./public/search/embed/*"
    end

  end

end

namespace :openoffice do

  task :start do
    utility = RUBY_PLATFORM.match(/darwin/) ? "/Applications/LibreOffice.app/Contents/MacOS/soffice.bin" : "soffice"
    sh "nohup #{utility} --headless --accept=\"socket,host=127.0.0.1,port=8100;urp;\" --nofirststartwizard > log/soffice.log 2>&1 & echo $! > ./tmp/pids/soffice.pid"
  end

end

# def nginx_pid
#   pid_locations = ['/var/run/nginx.pid', '/usr/local/nginx/logs/nginx.pid', '/opt/nginx/logs/nginx.pid']
#   @nginx_pid ||= pid_locations.detect {|pid| File.exists?(pid) }
# end

