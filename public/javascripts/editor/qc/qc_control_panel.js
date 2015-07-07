dc.ui.ViewerQCControlPanel = Backbone.View.extend({

  id :                  'control_panel',

  //Initialize: base model for this view is the group that is being displayed
  initialize : function() {
    this.deOneSubpanel = new dc.ui.ViewerQcDeSubpanel({de: 1});
    this.qcSubpanel = new dc.ui.ViewerQcSubpanel();
    this.deTwoSubpanel = new dc.ui.ViewerQcDeSubpanel({de: 2});

    this.listenTo(dc.app.editor.annotationEditor, 'annotationSelected', this.handleAnnotationSelect);

    this.listenTo(this.deOneSubpanel, 'requestAnnotationClone', this.passAnnoCloneRequest);
    this.listenTo(this.deOneSubpanel, 'requestGroupClone', this.handleGroupCloneRequest);
    this.listenTo(this.deTwoSubpanel, 'requestAnnotationClone', this.passAnnoCloneRequest);
    this.listenTo(this.deTwoSubpanel, 'requestGroupClone', this.handleGroupCloneRequest);
    this.listenTo(this.qcSubpanel, 'removeFromQC', this.handleRemoveFromQC);
    this.listenTo(this.qcSubpanel, 'groupDeleted', this.refreshDE);

    this.render();
  },


  render : function(annoId) {
    var _deView = this;
    var _mainJST = JST['qc_control_panel'];
    $(this.el).html(_mainJST());

    this.$('#de1_view').html(this.deOneSubpanel.el);
    this.$('#qc_view').html(this.qcSubpanel.el);
    this.$('#de2_view').html(this.deTwoSubpanel.el);

    return this;
  },


  handleAnnotationSelect: function(anno) {
    this.deOneSubpanel.clearAnnotations();
    this.deTwoSubpanel.clearAnnotations();
    if( anno.account_id == window.currentDocumentModel.de_one_id ){ this.deOneSubpanel.handleAnnotationSelect(anno); }
    if( anno.account_id == window.currentDocumentModel.de_two_id ){ this.deTwoSubpanel.handleAnnotationSelect(anno); }
  },


  //Hear clone request from DE panel; create anno in QC panel
  passAnnoCloneRequest: function(annos, group_id, backup, de_requester){
    var thisView = this;
    var failedTitleString = "";
    for(var i=0; i < annos.length; i++) {
      if (this.qcSubpanel.approveDEPoint(annos[i], group_id)) {
        annos[i].set({approved_count: annos[i].get('approved_count') + 1});
        dc.app.editor.annotationEditor.markApproval(annos[i].id, group_id, true);
      }else{
        failedTitleString += "<br>\'" + annos[i].get('title') + "\'";
      }
    }

    var handleSuccess = function(){
      if(backup) {
        if (de_requester == 1) { thisView.deOneSubpanel.handleApprovalSuccess(); }
        if (de_requester == 2) { thisView.deTwoSubpanel.handleApprovalSuccess(); }
        thisView.qcSubpanel.handleApprovalSuccess();
      }
    };

    if(failedTitleString.length > 0){ dc.ui.Dialog.alert(_.t('duplicate_titles_fail', failedTitleString)); }
    else{ this.qcSubpanel.save(handleSuccess); }

  },


  //Pass along group clone request and reload this view to cloned group
  handleGroupCloneRequest: function(group) {
    var _thisView = this;
    group.clone(this.qcSubpanel.model.id, function(response){
       _thisView.qcSubpanel.save(function() {
           _thisView.qcSubpanel.reloadPoints(response.id);
       });
    });
  },


  //If anno is passed, have DV show it as unapproved.  Refresh DE views.
  handleRemoveFromQC: function(anno, group_id){
    if( anno ){ dc.app.editor.annotationEditor.markApproval(anno.id, group_id, false); }
    this.refreshDE(anno);
  },


  //Refresh DE views
  refreshDE: function(anno){
    this.deOneSubpanel.reloadCurrent();
    this.deTwoSubpanel.reloadCurrent();
  }
});
