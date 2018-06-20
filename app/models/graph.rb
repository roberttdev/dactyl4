class Graph < ActiveRecord::Base
  belongs_to :document
  belongs_to :groups
  belongs_to :highlight

  before_destroy :clear_highlights


  def self.create(params)
      if params[:highlight_id].nil? && !params[:location].nil? then
          highlight = Highlight.create({
                                           :document_id => params[:document_id],
                                           :image_link => params[:image_link],
                                           :location => params[:location],
                                           :page_number => params[:page_number]
                                       })
          params[:highlight_id] = highlight.id
      end
      params = params.except(:image_link,:location,:page_number)
      super(params)
  end


  def clear_highlights
      #If this is the last object attached to a highlight, delete it
      if self.highlight and self.highlight.annotations.length == 0 and self.highlight.graphs.length == 1 then
          self.highlight.destroy
      end
  end


  def as_json(opts={})
    {
        'account_id'          => account_id,
        'document_id'         => document_id,
        'graph_json'          => graph_json,
        'group_id'            => group_id,
        'highlight_id'        => highlight_id,
        'id'                  => id,
        'image_link'          => self.highlight ? self.highlight.image_link : nil,
        'iteration'           => iteration,
        'location'            => self.highlight ? self.highlight.location : nil
    }
 end
end