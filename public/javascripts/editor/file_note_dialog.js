dc.ui.FileNoteDialog = dc.ui.Dialog.extend({

  id                : 'file_note_dialog',
  className         : 'dialog tempalog',
  template          : null,
  parentTemplate    : null,
  noteViewList      : [],


  dataEvents : {
      'click .cancel'     : 'close',
      'click .ok'         : 'save'
  },


  constructor : function(document, noteList, onClose) {
    this.document           = document;
    this.noteList           = noteList;
    this.options.onClose    = onClose;
    this.events         = _.extend({}, this.events, this.dataEvents);
    this._mainJST = JST['file_note_dialog'];
    _.bindAll(this, 'render');
    dc.ui.Dialog.call(this, {mode : 'custom', title : _.t('file_note'), saveText : _.t('save') });

    _thisView = this;

    this.render();

    $(document.body).append(this.el);
  },


  render : function() {
    var _thisView = this;

    //Base dialog object needs
    dc.ui.Dialog.prototype.render.call(this);
    this._container = this.$('.custom');

    //Main template
    var qa_note = this.document.get('qa_note') ? this.document.get('qa_note').replace(/(?:\r\n|\r|\n)/g, '<br />') : nil;
    this._container.html(this._mainJST({qa_note: qa_note}));

    //Notes
    this.noteViewList = [];
    this.noteList.each(function(model, index) {
        _view = new dc.ui.FileNoteListing({model: model});
        _thisView.noteViewList.push(_view);
        _view.render();
    });
    $('#note_section').html(_.pluck(this.noteViewList,'el'));

    return this;
  },


  save : function(success) {
    _thisView = this;

    this.document.set({qa_note: $('#qa_note').val()});
    this.document.save({},{success: function() {
        _thisView.close();
    }});
  }

}, {

  // This static method is used for conveniently opening the dialog for
  // any selected template.
  open : function(document, noteList) {
    new dc.ui.FileNoteDialog(document, noteList);
  }

});
