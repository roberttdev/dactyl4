dc.ui.ViewerQAControlPanel = dc.ui.ViewerBaseControlPanel.extend({
  id :                  'control_panel',
  AnnoClass:            FuncUtils.stringToFunction("dc.ui.QAAnnotationListing"),
  //Initialize: base model for this view is the group that is being displayed
  initialize : function() {
     dc.ui.ViewerBaseControlPanel.prototype.initialize.apply(this, arguments);
    _.bindAll(this, 'handleMarkCompleteResponse');

    this.events['click .approve_all'] = 'approveAll';
    this.listenTo(dc.app.editor.annotationEditor, 'annotationSelected', this.handleAnnotationSelect);
  },


  render : function(annoId) {
    var _deView           = this;
    var _mainJST = JST['qa_control_panel'];
    var templateName    = this.model.get('group_template') == null ? null : this.model.get('group_template').name;
    $(this.el).html(_mainJST({template_name: templateName ? templateName.substring(0,39) : null}));

    //Group Navigation
    this.$('.group_navigation').html(this.generateGroupNav());

    //Group Listings
    this.model.children.each(function(model, index){
        var _groupView = _deView.addGroup({
            model: model,
            showClone: false,
            showEdit: false,
            showDelete: false,
            showSubitemStatus: true,
            showApproval: true,
            showApprovalStatus: true
        });
    });
    this.$('#group_section').html(_.pluck(this.groupViewList, 'el'));

    //Annotations
    this.model.annotations.each(function(model, index) {
        _anno = _deView.addDataPoint(model, (model.id == annoId));
        _deView.listenTo(_anno, 'qaAddress', _deView.handleQAAddress);
    });
    this.$('#annotation_section').html(_.pluck(this.pointViewList,'el'));

    return this.el;
  },


  //Handle click of 'mark complete' button
  markComplete: function(){
    var _thisView = this;

    _thisView.docModel.markComplete({
        data: {},
        error: _thisView.handleMarkCompleteResponse,
        success: function(){
          if(window.opener){ window.opener.location.reload(); }
          window.close();
        }
    });
  },


  //Handle error response from mark complete call
  handleMarkCompleteResponse: function(responseData) {
    //If there is an error..
    if (responseData.errorText == 'no_qc_rating') {
      //And that error is no QC rating, open prompt window to collect it
      dc.ui.QACompleteDialog.open(this.docModel, responseData.data.supp_de);
    }else{
      //Otherwise, display error in alert and reload to any passed data
      this.reloadPoints(responseData.data.group_id, responseData.data.id);
      dc.ui.Dialog.alert(responseData.errorText);
    }
  },


  //When annotation selected in DV, find a data point that's waiting for DV input or matches the annotation and pass response to it.  If neither,
  //reload to a group that contains a point that matches it
  handleAnnotationSelect: function(anno){
    var _deView = this;

    //If the group selected is this group, find and highlight point; otherwise save and reload proper group
    if( anno.group_id == this.model.id ){
        _view = _.find(this.pointViewList, function(view){ return view.model.id == anno.id; });
        _view.highlight();
    }else {
        _deView.reloadPoints(anno.group_id, anno.id);
    }
  },


  //Approve all unaddressed annotations (NOT GROUPS)
  approveAll: function(){
    var allAnnosApproved = true;
    var allGroupsApproved = true;

    for(var i=0; i < this.pointViewList.length; i++){
      if( this.pointViewList[i].model.get('approved') ){
        //Track if anything is rejected
        if( this.pointViewList[i].model.get('qa_reject_note') != null ){ allAnnosApproved = false; }
      }else{
        this.pointViewList[i].handleApprove();
      }
    }

    for(var i=0; i < this.model.children.models.length; i++){
      if( !this.model.children.models[i].get('approved') || this.model.children.models[i].get('qa_reject_note') ){ allGroupsApproved = false;}
    }

    if( allAnnosApproved && allGroupsApproved && !this.model.get('base') ){
      //If all approved, and parent group isn't approved, approve it
      if( !this.model.get('approved') ){
          var _thisView = this;
          this.model.set({approved: true, qa_reject_note: null});
          this.model.update_approval(false,
                function(){
                    _thisView.changeGroupView(_thisView.model.get('parent_id'));
                    _thisView.model.approveGroup();
                },
                function(){
                    alert('Error: Approval of parent group failed!');
                });
      }else{
          this.changeGroupView(this.model.get('parent_id'));
      }
    }
  },


  //If anno approved/rejected, mark as addressed in DV
  handleQAAddress: function(annoView){
    dc.app.editor.annotationEditor.markApproval(annoView.model.get('highlight_id'), annoView.model.get('id'), 'annotation', true);
  },


  //Handle clicking of file note
  handleFileNote: function(){
      dc.ui.QAFileNoteDialog.open(this.docModel);
  }
});
