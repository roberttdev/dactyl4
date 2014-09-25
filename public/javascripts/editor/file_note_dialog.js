dc.ui.FileNoteDialog = dc.ui.Dialog.extend({

  id                : 'file_note_dialog',
  className         : 'dialog tempalog',
  template          : null,
  parentTemplate    : null,
  fieldViewList     : [],

  dataEvents : {
      'click .cancel'     : 'close',
      'click .ok'         : 'save'
  },


  constructor : function(document) {
    this.document    = document;
    this.events         = _.extend({}, this.events, this.dataEvents);
    this._mainJST = JST['file_note_dialog'];
    _.bindAll(this, 'render');
    dc.ui.Dialog.call(this, {mode : 'custom', title : _.t('complete_qc'), saveText : _.t('save') });

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
    _thisView = this;

    var file_note = $('#qa_file_note').val();

    //Trigger save

  }

}, {

  // This static method is used for conveniently opening the dialog for
  // any selected template.
  open : function(document) {
    new dc.ui.FileNoteDialog(document);
  }

});
