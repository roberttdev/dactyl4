dc.ui.QANoSuppConfirmDialog = dc.ui.Dialog.extend({

  id                : 'qa_no_supp_confirm_dialog',
  className         : 'dialog tempalog',
  template          : null,
  parentTemplate    : null,
  noteViewList      : [],


  dataEvents : {
      'click .cancel'     : 'close',
      'click .ok'         : 'save'
  },


  constructor : function(document, noteList, qc_rating, qa_note) {
    this.document           = document;
    this.noteList           = noteList;
    this.qc_rating          = qc_rating;
    this.qa_note            = qa_note;
    this.events         = _.extend({}, this.events, this.dataEvents);
    this._mainJST = JST['qa_no_supp_confirm'];
    _.bindAll(this, 'render');
    dc.ui.Dialog.call(this, {
        mode : 'custom',
        title : _.t('qa_confirm_supp_opt_out'),
        saveText : 'OK',
        noOverlay: true,
        noOK: false
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
    for(var i=0; i < this.noteList.length; i++){
      model = new dc.model.FileNote(this.noteList[i]);
      _view = new dc.ui.FileNoteListing({model: model});
      _thisView.noteViewList.push(_view);
      _view.render(false);
    }

    $('#note_section table').html(_.pluck(this.noteViewList,'el'));

    return this;
  },


  save : function(success) {
    _thisView = this;

    this.document.markComplete({
      data: {
        'skip_de': true,
        'qc_rating': this.qc_rating,
        'qa_note': this.qa_note
      },
      success: function() {
        if(window.opener){ window.opener.location.reload(); }
        window.close();
      }
    });
  },


  requestPointReload : function(payload){
    this.trigger('requestPointReload', payload);
  }

}, {

  // This static method is used for conveniently opening the dialog for
  // any selected template.
  open : function(document, noteList, qc_rating, qa_note) {
    new dc.ui.QANoSuppConfirmDialog(document, noteList, qc_rating, qa_note);
  }

});
