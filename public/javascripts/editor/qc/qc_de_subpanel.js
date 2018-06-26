dc.ui.ViewerQcDeSubpanel = dc.ui.ViewerBaseControlPanel.extend({

  AnnoClass: FuncUtils.stringToFunction("dc.ui.QCDEAnnotationListing"),

  initialize: function(options) {
    this.el.id = this.el.id + '_' + options['de'];
    this.reloadParams = {de: options['de']};
    dc.ui.ViewerBaseControlPanel.prototype.initialize.apply(this, arguments);

    this.events['click .approve_all'] = 'approveAll';
  },


  render : function(annoId) {
    var _deView           = this;
    var _mainJST = JST['qc_de_subpanel'];
    var templateName    = this.model.get('group_template') == null ? null : this.model.get('group_template').name;
    $(this.el).html(_mainJST({template_name: templateName ? templateName.substring(0,39) : null}));

    //Group Navigation
    this.$('.group_navigation').html(this.generateGroupNav());

    //Group Listings
    if(!this.model.children || this.model.children.length <= 0){ this.$('#group_section').html('<div class="group_listing">(no groups)</div>'); }
    else {
      this.model.children.each(function (model, index) {
        _deView.addGroup({
          model: model,
          showEdit: false,
          showDelete: false,
          showSubitemStatus: true,
          strikethrough: !(model.get('qa_reject_note') == null)
        });
      });
      this.$('#group_section').html(_.pluck(this.groupViewList, 'el'));
    }

    //Annotations
    if(!this.model.annotations || this.model.annotations.length <= 0){  this.$('#annotation_section').html('<div class="group_listing">(no points)</div>'); }
    else {
      this.model.annotations.each(function (model, index) {
        _annoView = _deView.addDataPoint(model, (model.id == annoId));
        _deView.listenTo(_annoView, 'requestAnnotationClone', _deView.handleAnnoCloneRequest);
      });
      this.$('#annotation_section').html(_.pluck(this.pointViewList, 'el'));
    }

    return this.el;
  },


  //When annotation selected in DV, find a data point that's waiting for DV input or matches the annotation and pass response to it.  If neither,
  //reload to a group that contains a point that matches it
  handleAnnotationSelect: function(anno){
    var _deView = this;

    //If the anno has a match, trigger match logic
    if( anno.match_id != null ){ this.trigger('requestAnnotationMatch', anno, this.reloadParams.de); }

    //If the group selected is this group, find and highlight point; otherwise save and reload proper group
    if( anno.group_id == _deView.group_id ) {
      _view = _.find(this.pointViewList, function(view){ return view.model.id == anno.id; });
      if( _view ){ _view.highlight(); }
    }else {
      _deView.reloadPoints(anno.group_id, anno.id);
    }
  },


  //Reload to group containing an annotation's match when it's selected in the other window.
  handleMatchRequest: function(anno){
    var _thisView = this;
    match = new dc.model.Annotation({document_id: this.docModel.id, id: anno.match_id});
    match.fetch({success: function(anno){
      _thisView.reloadPoints(anno.get('group_id'));
    }});

  },


  //Listens for an annotation to request to be cloned and passes it to anything
  //listening to events from this control panel
  //Takes in an array of annotations, and whether to indicate you want to back up a level if approval succeeds
  passAnnoCloneRequest: function(annos, backup){
    this.trigger('requestAnnotationClone', annos, this.model.id, backup, this.reloadParams.de);
  },


  handleAnnoCloneRequest: function(annoView){
    this.passAnnoCloneRequest([annoView], false);
  },


  //Request approval/clone for all current annotations
  approveAll: function(anno){
    //Calculate whether you would like to back up a level if approval succeeds
    var groupsApproved = true;

    //If all groups are approved, refresh to parent group
    for(var i=0; i < this.model.children.models.length; i++){
      if( this.model.children.models[i].get('unapproved_count') > 0 ){
        groupsApproved = false;
        break;
      }
    }

    this.passAnnoCloneRequest(this.model.annotations.models, groupsApproved);
  },


  //Pass along group clone request and reload this view to cloned group
  handleGroupCloneRequest: function(group) {
    this.trigger('requestGroupClone', group);
    this.reloadPoints(group.id);
  },


  //If a displayed anno has been removed from QC, update it
  handleRemoveFromQC: function(anno){
    _view = _.find(this.pointViewList, function(view){ return view.model.id == anno.id; });
    if( _view ){ _view.model.set({approved: false}); }
  },


  //Handle message from QC that approval succeeded
  handleApprovalSuccess: function(){
    this.changeGroupView(this.model.get('parent_id'));
  }

});
