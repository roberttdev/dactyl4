dc.ui.QCDEAnnotationListing = dc.ui.BaseAnnotationListing.extend({

  render : function() {
    dc.ui.BaseAnnotationListing.prototype.render.apply(this, arguments);

    this.$('.delete_item').hide();

    //qc_approved not passed yet
    /*if(this.model.getAttribute('qc_approved') == 'true') {
        this.$('.annotation_status').removeClass('incomplete');
        this.$('.annotation_status').addClass('complete');
    }*/

    return this;
  }

});
