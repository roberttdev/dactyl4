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
  approveDEPoint: function(anno, group_id){
    if( this.hasTitle(anno.get('title')) ){
        dc.ui.Dialog.alert(_.t('duplicate_titles_fail'));
        return false;
    }else {
        anno.set({based_on: anno.get('annotation_group_id'), based_on_group_id: group_id});
        var _view = this.createDataPointCopy(anno.attributes);
        this.listenTo(_view, 'removeFromQC', this.passRemoveFromQC);
        return true;
    }
  },


  //Send document back to DE
  rejectDE: function(){
      dc.ui.QCRejectDialog.open(this.model.get('document_id'));
  },


  //Remove qc point model/view and pass removeFromQC event up the chain
  passRemoveFromQC: function(annoView, group_id) {
      var anno = annoView.model;
      this.model.annotations.remove(anno);

      for(var i=0; i < this.pointViewList.length; i++){
        if( this.pointViewList[i].cid == annoView.cid ){ this.pointViewList.splice(i, 1); }
      }

      this.trigger('removeFromQC', anno, group_id);
  },


  //Pass group delete notification up
  handleGroupDelete: function(group) {
      this.reloadAnnotations();
      this.trigger('groupDeleted', group);
  },


  //Handle click of 'mark complete' button
  markComplete: function(){
      var _thisView = this;
      this.save(function(){ dc.ui.QCCompleteDialog.open(_thisView.docModel); });
  }

});
