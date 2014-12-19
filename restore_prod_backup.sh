sudo service postgresql restart
sudo -u postgres dropdb dcloud_development
sudo -u postgres psql -f backup.sql postgres
sudo -u postgres psql < convert_prod_backup.sql
s3cmd sync s3://dactyl-docs/documents public/asset_store
