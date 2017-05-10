#!bin/bash

#Install support packages
sudo apt-get install -y libcurl4-openssl-dev
sudo apt-get install -y libcurl4-gnutls-dev
sudo apt-get install -y build-essential libssl-dev zlib1g-dev git sqlite3 libsqlite3-dev libpcre3-dev lzop libxslt-dev  libitext-java graphicsmagick pdftk xpdf poppler-utils libpcre3-dev libreoffice libreoffice-java-common tesseract-ocr ghostscript libxml2-dev curl tesseract-ocr-eng tesseract-ocr-deu tesseract-ocr-spa tesseract-ocr-fra g++ apache2-utils git-core

#Install RVM and Ruby
gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
\curl -sSL https://get.rvm.io | bash -s stable --rails
export PATH="/usr/local/rvm/bin"
source /usr/local/rvm/scripts/rvm
rvm install 2.1.8
rvm use 2.1.8 --default

#Install Rails and support gems
gem install mime-types --version=1.25
gem install --no-ri --no-rdoc cloud-crowd
gem install --no-ri --no-rdoc sqlite3
gem install --no-ri --no-rdoc pg bundler
gem install --no-ri --no-rdoc passenger
gem install --no-ri --no-rdoc libxml-ruby
gem install rails -v4.1.6

#Install Node.js
cd /etc
sudo git clone git://github.com/nodejs/node.git
cd node
sudo ./configure
sudo make
sudo make install
cd /srv/www/documentcloud

#Install and copy default configuration for Nginx/Passenger
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys 561F9B9CAC40B2F7
sudo apt-get install -y apt-transport-https ca-certificates
sudo sh -c 'echo deb https://oss-binaries.phusionpassenger.com/apt/passenger trusty main > /etc/apt/sources.list.d/passenger.list'
sudo apt-get update
sudo apt-get install -y nginx-extras passenger
sudo cp /srv/www/documentcloud/config/server/files/nginx/nginx.conf /etc/nginx
sudo cp /srv/www/documentcloud/config/server/files/nginx/$1.conf /etc/nginx/sites-enabled/dactyl.conf
sudo service nginx restart

#Set proper permissions for Nginx
sudo chmod g+x,o+x /srv/www/documentcloud

#Install app bundle and migrate DB
cd /srv/www/documentcloud
bundle install

#Load Cloud Crowd schema
crowd load_schema -c /srv/www/documentcloud/config/cloud_crowd/$1

#Set supplementary servers to autostart, and start them
echo -e "su -l -c \"cd /srv/www/documentcloud; bundle exec rake $1 sunspot:solr:start\"  $USER\n" >> /srv/www/documentcloud/local.autostart
echo -e "su -l -c \"cd /srv/www/documentcloud; bundle exec rake $1 crowd:server:start\"  $USER\n" >> /srv/www/documentcloud/local.autostart
echo -e "su -l -c \"cd /srv/www/documentcloud; bundle exec rake $1 crowd:node:start\"  $USER\n\nexit 0" >> /srv/www/documentcloud/local.autostart
sudo mv /srv/www/documentcloud/local.autostart /etc/init.d
sudo chown root /etc/init.d/local.autostart
sudo chmod 755 /etc/init.d/local.autostart
sudo update-rc.d local.autostart defaults
sh /etc/init.d/local.autostart

#Set up analytics DB structure
export PGPASSWORD='documentcloudVirtualMachine'; psql -U documentcloud dcloud_analytics_$1 < /srv/www/documentcloud/db/analytics_structure.sql

#Set up DB structure
bundle exec rake db:migrate RAILS_ENV=$1

#Ensure project has Rails 4 binaries
rake rails:update:bin

#Create default DACTYL group/admin
bin/rails runner -e $1 config/server/scripts/fresh_user_setup.rb

#Minify code (if production)
if [[ "$1" == "production" ]]; then
    bundle exec rake production app:jammit
fi






