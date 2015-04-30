dc.ui.SuppDEAnnotationListing = dc.ui.BaseAnnotationListing.extend({

  render : function() {
    dc.ui.BaseAnnotationListing.prototype.render.apply(this, arguments);

    //Clone/Delete
    if( this.model.get('approved') || this.model.get('qa_reject_note') ){
      this.$('.clone_item').hide();
      this.$('.delete_item').hide();
    }

    //Approval
    if( this.model.get('approved') ){ this.$('.row_status').removeClass('incomplete'); }
    if( this.model.get('qa_reject_note') != null ){
      this.$('.row_status').addClass('rejected');
      this.$('.annotation_listing').addClass('rejected');
    }else {
      this.$('.row_status').addClass('complete');
    }

    return this;
  },

  //prepareForAnnotation: signal DV to create annotation and wait for response
  prepareForAnnotation : function() {
    var _thisView = this;
    var _canEdit = this.model.get('iteration') == currentDocumentModel.iteration;

    dc.app.editor.annotationEditor.open(this.model, this.group_id, _canEdit, function(){
      _thisView.openDocumentTab();
      _thisView.highlight();
    });
  }
});
