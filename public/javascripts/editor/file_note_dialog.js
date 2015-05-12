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


  constructor : function(document, noteList, onClose, showApproval) {
    this.document           = document;
    this.noteList           = noteList;
    this.options.onClose    = onClose;
    this.showApproval       = showApproval != null ? showApproval : true;
    this.events         = _.extend({}, this.events, this.dataEvents);
    this._mainJST = JST['file_note_dialog'];
    _.bindAll(this, 'render');
    dc.ui.Dialog.call(this, {
        mode : 'custom',
        title : _.t('paragraph_description_of_document'),
        saveText : _.t('save'),
        noOverlay: true,
        noOK: document.get('status') != 7 //Don't show OK if status is not In QA
    });

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
    var qa_note = this.document.get('qa_note') ? this.document.get('qa_note').replace(/(?:\r\n|\r|\n)/g, '<br />') : null;
    this._container.html(this._mainJST({qa_note: qa_note}));

    //Notes
    this.noteViewList = [];
    this.noteList.each(function(model, index) {
        _view = new dc.ui.FileNoteListing({model: model});
        _thisView.noteViewList.push(_view);
        _view.render(_thisView.showApproval);
        _thisView.listenTo(_view, 'requestPointReload', _thisView.requestPointReload);
    });
    $('#note_section table').html(_.pluck(this.noteViewList,'el'));

    return this;
  },


  save : function(success) {
    _thisView = this;

    this.document.set({qa_note: $('#qa_note').val()});
    this.document.save({},{success: function() {
        _thisView.close();
    }});
  },


  requestPointReload : function(payload){
    this.trigger('requestPointReload', payload);
  }

}, {

  // This static method is used for conveniently opening the dialog for
  // any selected template.
  open : function(document, noteList) {
    new dc.ui.FileNoteDialog(document, noteList);
  }

});
