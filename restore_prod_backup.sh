#!bin/bash

sudo service postgresql restart
sudo -u postgres dropdb dcloud_development
sudo -u postgres createdb dcloud_development
sudo -u postgres pg_restore -d dcloud_development prod_bkup.backup
bundle exec rake db:migrate
s3cmd sync s3://dactyl-docs/documents public/asset_store
