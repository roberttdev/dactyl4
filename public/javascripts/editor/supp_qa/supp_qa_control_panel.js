dc.ui.ViewerSuppQAControlPanel = dc.ui.ViewerQAControlPanel.extend({
  id :                  'control_panel',
  AnnoClass:            FuncUtils.stringToFunction("dc.ui.SuppQAAnnotationListing"),
  //Initialize: base model for this view is the group that is being displayed
  initialize : function() {
     dc.ui.ViewerQAControlPanel.prototype.initialize.apply(this, arguments);
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
            showApproval: (model.get('iteration') == currentDocumentModel.iteration),
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
  }

});
