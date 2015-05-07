dc.ui.ViewerSuppQCControlPanel = dc.ui.ViewerQCControlPanel.extend({

  id :                  'control_panel',

  //Initialize: base model for this view is the group that is being displayed
  initialize : function() {
    this.deOneSubpanel = new dc.ui.ViewerQcDeSubpanel({de: 1});
    this.qcSubpanel = new dc.ui.ViewerSuppQcSubpanel();
    this.deTwoSubpanel = new dc.ui.ViewerQcDeSubpanel({de: 2});

    this.listenTo(dc.app.editor.annotationEditor, 'annotationSelected', this.handleAnnotationSelect);

    this.listenTo(this.deOneSubpanel, 'requestAnnotationClone', this.passAnnoCloneRequest);
    this.listenTo(this.deOneSubpanel, 'requestGroupClone', this.handleGroupCloneRequest);
    this.listenTo(this.deTwoSubpanel, 'requestAnnotationClone', this.passAnnoCloneRequest);
    this.listenTo(this.deTwoSubpanel, 'requestGroupClone', this.handleGroupCloneRequest);
    this.listenTo(this.qcSubpanel, 'removeFromQC', this.handleRemoveFromQC);
    this.listenTo(this.qcSubpanel, 'groupDeleted', this.refreshDE);
    this.listenTo(this.qcSubpanel, 'requestOriginalDEReload', this.reloadOriginalDE);

    this.render();
  },

  reloadOriginalDE : function(group_id, annotation_id) {
    this.deOneSubpanel.reloadPoints(group_id, annotation_id);
  }
});
