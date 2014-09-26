dc.ui.QACompleteDialog = dc.ui.Dialog.extend({

  id                : 'qa_complete_dialog',
  className         : 'dialog tempalog',
  template          : null,
  parentTemplate    : null,
  fieldViewList     : [],

  dataEvents : {
      'click .cancel'     : 'close',
      'click .ok'         : 'save'
  },


  constructor : function(docModel) {
    this.document    = docModel;
    this.events         = _.extend({}, this.events, this.dataEvents);
    this._mainJST = JST['qa_complete_dialog'];
    _.bindAll(this, 'render');
    dc.ui.Dialog.call(this, {mode : 'custom', title : _.t('request_supp_work'), saveText : _.t('save') });

    _thisView = this;

    this.render();

    $(document.body).append(this.el);
  },


  render : function() {
    //Base dialog object needs
    dc.ui.Dialog.prototype.render.call(this);
    this._container = this.$('.custom');

    //Main template
    this._container.html(this._mainJST({}));

    return this;
  },


  save : function(success) {
    //Trigger save
    this.document.markComplete({
        data: {
            'self_assign': $("#self_assign").prop('checked')
        },
        success: window.close
      });
  }

}, {

  // This static method is used for conveniently opening the dialog for
  // any selected template.
  open : function(document) {
    new dc.ui.QACompleteDialog(document);
  }

});
