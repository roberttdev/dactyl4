dc.ui.DEAnnotationListing = dc.ui.BaseAnnotationListing.extend({
  showEdit: true, //Show edit UI in DV

  render : function() {
    dc.ui.BaseAnnotationListing.prototype.render.apply(this, arguments);

    if( this.model.get('location') ){
        this.$('.clone_item').hide();
        this.$('.annotation_status').removeClass('incomplete');
        this.$('.annotation_status').addClass('complete');
    }

    return this;
  }
});
