dc.ui.ViewerQCControlPanel = Backbone.View.extend({

  id :                  'control_panel',
  template_listing:     null,
  pointViewList:        null,
  groupViewList:        null,

  events : {
  },

  //Initialize: base model for this view is the group that is being displayed
  initialize : function() {
    this.deOneSubpanel = new dc.ui.ViewerQcDeSubpanel({de: 1});
    this.qcSubpanel = new dc.ui.ViewerQcSubpanel();
    this.deTwoSubpanel = new dc.ui.ViewerQcDeSubpanel({de: 2});

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
  }
});
