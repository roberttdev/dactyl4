class Review < ActiveRecord::Base
  has_one :document

  scope :current, ->(document) { where(:document_id => document.id, :iteration => document.iteration) }
end
