class HighlightsController < ApplicationController
  include DC::Access

  layout false

  before_action :login_required, :except => [:index, :show, :print,:cors_options]
  skip_before_action :verify_authenticity_token

  # In the workspace, request a listing of highlights.
  def index
    doc = Document.find(params[:document_id])
    json doc.ordered_highlights(current_account).map {|h| h.canonical({:account => current_account})}
  end

  private

  def current_document
    @current_document ||= Document.accessible(current_account, current_organization).find(params[:document_id])
  end

end
