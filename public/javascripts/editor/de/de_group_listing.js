dc.ui.DEGroupListing = dc.ui.BaseGroupListing.extend({

  initialize : function() {
    dc.ui.BaseGroupListing.prototype.initialize.apply(this, arguments);

    if( this.model.get('is_graph_data') ){
        this.showEdit = false;
        this.showDelete = false;
        this.showClone = false;
    }

    return this;
  }
});
