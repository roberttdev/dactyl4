dc.ui.SuppDEAnnotationListing = dc.ui.BaseAnnotationListing.extend({
  showEdit: true, //Show edit UI in DV

  render : function() {
    dc.ui.BaseAnnotationListing.prototype.render.apply(this, arguments);

    can_edit = dc.account == dc.model.Account.ADMINISTRATOR || this.model.get('qa_reject_note') || !this.model.get('approved')

    //Clone/Delete
    if( !can_edit ){
      this.$('.clone_item').hide();
      this.$('.delete_item').hide();
    }

    //Approval
    if( this.model.get('approved') ){ this.$('.row_status').removeClass('incomplete'); }
    this.model.get('qa_reject_note') != null ? this.$('.row_status').addClass('rejected') : this.$('.row_status').addClass('complete');

    return this;
  }
});
