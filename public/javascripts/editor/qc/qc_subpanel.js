dc.ui.ViewerQcSubpanel = dc.ui.ViewerBaseControlPanel.extend({

  AnnoClass:    FuncUtils.stringToFunction("dc.ui.QCAnnotationListing"),

  reloadParams: {qc: true},


  initialize: function(options) {
      dc.ui.ViewerBaseControlPanel.prototype.initialize.apply(this, arguments);

      this.events['click .reject'] = 'rejectDE';
  },


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
       _anno = _deView.addDataPoint(model, (model.id == annoId));
       _deView.listenTo(_anno, 'removeFromQC', _deView.passRemoveFromQC);
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
  },


  //Take in DE point, and make an approved copy if it doesn't already exist
  approveDEPoint: function(anno){
    if( this.hasTitle(anno.get('title')) ){
        dc.ui.Dialog.alert(_.t('duplicate_titles_fail'));
    }else {
        anno.set({approved: true});
        var _view = this.createDataPointCopy(anno.attributes);
        this.listenTo(_view, 'removeFromQC', this.passRemoveFromQC);
    }
  },


  //Send document back to DE
  rejectDE: function(){
      dc.ui.QCRejectDialog.open(this.model.get('document_id'));
  },


  //Pass removeFromQC event up the chain
  passRemoveFromQC: function(anno) {
      this.model.annotations.remove(anno);
      this.trigger('removeFromQC', anno);
  },


  //Pass group delete notification up
  handleGroupDelete: function(group) {
      this.trigger('groupDeleted', group);
  }

});
