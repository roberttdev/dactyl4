dc.ui.QCDEAnnotationListing = dc.ui.BaseAnnotationListing.extend({

  initialize: function() {
      this.listenTo(this.model, 'change', this.render);

      dc.ui.BaseAnnotationListing.prototype.initialize.apply(this, arguments);
  },


  render : function() {
    dc.ui.BaseAnnotationListing.prototype.render.apply(this, arguments);

    this.$('.delete_item').hide();

    if(this.model.get('approved_count') > 0) {
        this.$('.row_status').removeClass('incomplete');
        this.$('.row_status').addClass('complete');
    }

    return this;
  },


  //prepareForClone: close out any active annotating and set self in 'waiting for clone' status
  prepareForClone : function() {
      dc.app.editor.annotationEditor.close();
      this.trigger('requestAnnotationClone', this.model);
  }

});
