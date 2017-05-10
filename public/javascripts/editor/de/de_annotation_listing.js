dc.ui.DEAnnotationListing = dc.ui.BaseAnnotationListing.extend({
  showEdit: true, //Show edit UI in DV

  render : function() {
    dc.ui.BaseAnnotationListing.prototype.render.apply(this, arguments);

    if( this.model.get('location') || this.model.get('is_graph_data') ){
        this.$('.clone_item').hide();
        this.$('.row_status').removeClass('incomplete');
        this.$('.row_status').addClass('complete');
    }

    return this;
  }
});
