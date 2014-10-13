dc.ui.SuppDEAnnotationListing = dc.ui.BaseAnnotationListing.extend({
  showEdit: true, //Show edit UI in DV

  render : function() {
    dc.ui.BaseAnnotationListing.prototype.render.apply(this, arguments);

    this.$('.row_status').removeClass('incomplete');

    return this;
  }
});
