dc.ui.ExtractAnnotationListing = dc.ui.BaseAnnotationListing.extend({
  showEdit: true, //Show edit UI in DV

  render : function() {
    dc.ui.BaseAnnotationListing.prototype.render.apply(this, arguments);

    this.$('.delete_item').hide();
    this.$('.clone_item').hide();
    this.$('.row_status').hide();

    return this;
  }
});
