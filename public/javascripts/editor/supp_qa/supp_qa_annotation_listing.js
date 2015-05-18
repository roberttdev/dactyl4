dc.ui.SuppQAAnnotationListing = dc.ui.QAAnnotationListing.extend({

  showApprove: true,
  showReject:  true,

  render : function() {
    dc.ui.BaseAnnotationListing.prototype.render.apply(this, arguments);

    this.$('.clone_item').hide();
    this.$('.delete_item').hide();

    if (this.model.get('approved')) { this.setApprove(); }
    if (this.model.get('qa_reject_note') != null) { this.setReject(); }

    if( this.model.get('ag_iteration') != currentDocumentModel.iteration ){ this.$('.reject_item').hide(); }

    return this;
  }

});
