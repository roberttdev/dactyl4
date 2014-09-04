dc.ui.QCCompleteDialog = dc.ui.Dialog.extend({

  id                : 'qc_complete_dialog',
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
    this._mainJST = JST['qc_complete_dialog'];
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

    //If any rating <= 3, and no note is given, error
    var rating_one = parseInt($("#de_one_review").val());
    var rating_two = parseInt($("#de_two_review").val());
    var file_note = $('#qc_file_note').val();
    if( (rating_one <= 3 || rating_two <= 3) && file_note.length == 0 ){
        this.error(_.t('explain_rating_error'));
        return false;
    }

    //Trigger save
    this.document.markComplete({
        data: {
            'de_one_rating': rating_one,
            'de_two_rating': rating_two,
            'qc_note':       file_note
        },
        success: window.close
      });
  }

}, {

  // This static method is used for conveniently opening the dialog for
  // any selected template.
  open : function(document) {
    new dc.ui.QCCompleteDialog(document);
  }

});
