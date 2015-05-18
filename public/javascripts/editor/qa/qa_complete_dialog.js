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


  constructor : function(docModel, to_supp_de) {
    this.document    = docModel;
    this.to_supp_de  = to_supp_de;
    this.events      = _.extend({}, this.events, this.dataEvents);
    this._mainJST = JST['qa_complete_dialog'];
    _.bindAll(this, 'render', 'handleMarkCompleteError');
    dc.ui.Dialog.call(this, {mode : 'custom', title : _.t('complete_qa'), saveText : _.t('save') });

    _thisView = this;

    this.render();

    $(document.body).append(this.el);
  },


  render : function() {
    //Base dialog object needs
    dc.ui.Dialog.prototype.render.call(this);
    this._container = this.$('.custom');

    //Main template
    this._container.html(this._mainJST({to_supp_de: this.to_supp_de}));

    return this;
  },


  save : function(success) {
    var qc_rating = parseInt($("#qc_rating").val());
    var qa_note = $('#qa_note').val();
    if( qc_rating < 3 && qa_note.length == 0 ){
        this.error(_.t('explain_rating_error'));
        return false;
    }

    //Trigger save
    this.document.markComplete({
        data: {
            'self_assign': $("#self_assign").prop('checked'),
            'qc_rating': qc_rating,
            'qa_note': qa_note
        },
        success: function() {
          if(window.opener){ window.opener.location.reload(); }
          window.close();
        },
        error: this.handleMarkCompleteError
      });
  },


  handleMarkCompleteError: function(responseData){
    if( responseData.errorText == 'has_supp_de_claim' ){
        this.error(_.t('existing_supp_de_claim'));
    }
  }

}, {

  // This static method is used for conveniently opening the dialog for
  // any selected template.
  open : function(document, to_supp_de) {
    new dc.ui.QACompleteDialog(document, to_supp_de);
  }

});
