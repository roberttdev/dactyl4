# One-way migration to regenerate all of the images for the current documents.

class RegenerateThumbnails < ActiveRecord::Migration
  def self.up
    # wait for a second for CloudCrowd to come online.
    sleep 2
    ids = Document.all.pluck('id')
    RestClient.post(DC::CONFIG['cloud_crowd_server'] + '/jobs', {:job => {
      'action'  => 'regenerate_thumbnails',
      'inputs'  => ids
    }.to_json})
  end

  def self.down
  end
end
