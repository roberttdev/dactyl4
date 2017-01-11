#!bin/bash

#Install Postgres
sudo su -c "echo deb http://apt.postgresql.org/pub/repos/apt/ precise-pgdg main > /etc/apt/sources.list.d/pgdg.list"
wget --quiet -O - http://apt.postgresql.org/pub/repos/apt/ACCC4CF8.asc | sudo apt-key add -
sudo apt-get update
sudo apt-get install -y postgresql-9.3 postgresql-contrib libpq-dev

#Copy config, create default user/DB
sudo cp /srv/www/documentcloud/config/server/files/postgres/pg_hba.conf /etc/postgresql/9.3/main
sudo cp /srv/www/documentcloud/config/server/files/postgres/postgresql.conf /etc/postgresql/9.3/main
sudo service postgresql restart
sudo -u postgres createuser -s documentcloud
sudo -u postgres psql -c "alter user documentcloud password 'documentcloudVirtualMachine' "
sudo -u postgres createdb dcloud_$1
sudo -u postgres psql dcloud_$1 -c "CREATE EXTENSION hstore"

#Create analytics DB
export PGPASSWORD='documentcloudVirtualMachine'; createdb -U documentcloud dcloud_analytics_$1


