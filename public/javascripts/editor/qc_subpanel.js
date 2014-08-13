dc.ui.ViewerQcSubpanel = dc.ui.ViewerBaseControlPanel.extend({

  AnnoClass:    FuncUtils.stringToFunction("dc.ui.QCAnnotationListing"),

  reloadParams: {qc: true},

  render : function(annoId) {
    var _deView           = this;
    var _mainJST = JST['qc_subpanel'];
    var templateName    = this.model.get('group_template') == null ? null : this.model.get('group_template').name;
    $(this.el).html(_mainJST({template_name: templateName ? templateName.substring(0,39) : null}));

    //Group Navigation
    this.$('.group_navigation').html(this.generateGroupNav());

    //Group Listings
    this.model.children.each(function(model, index){
        _deView.addGroup({
            model: model,
            showStatus: false,
            showClone: false
        });
    });
    this.$('#group_section').html(_.pluck(this.groupViewList, 'el'));

    //Annotations
    this.model.annotations.each(function(model, index) {
       _deView.addDataPoint(model, (model.id == annoId));
    });
    this.$('#annotation_section').html(_.pluck(this.pointViewList,'el'));

    return this.el;
  },


  //Save: save all valid data point changes if no errors
  save: function(success) {
    var _deView = this;

    this.model.annotations.pushAll({success: function(){
      _deView.syncDV(success)
    }});
  }

});
