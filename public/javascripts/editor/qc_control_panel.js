dc.ui.ViewerQCControlPanel = dc.ui.ViewerBaseControlPanel.extend({

  id :                  'control_panel',
  template_listing:     null,
  pointViewList:        null,
  groupViewList:        null,

  events : {
  },

  //Initialize: base model for this view is the group that is being displayed
  initialize : function() {
    var docModel = this._getDocumentModel();
    this.viewer         = currentDocument;
    _.bindAll(this, 'render');

    this._mainJST = JST['qc_control_panel'];

    this.deOneSubpanel = new dc.ui.ViewerQcDeSubpanel({de: 1});
    this.qcSubpanel = new dc.ui.ViewerQcSubpanel();
    this.deTwoSubpanel = new dc.ui.ViewerQcDeSubpanel({de: 2});

    this.render();
  },


  render : function(annoId) {
    _deView = this;
    $(this.el).html(this._mainJST());

    this.$('#de1_view').html(this.deOneSubpanel.el);
    this.$('#qc_view').html(this.qcSubpanel.el);
    this.$('#de2_view').html(this.deTwoSubpanel.el);

    return this;
  }
});
