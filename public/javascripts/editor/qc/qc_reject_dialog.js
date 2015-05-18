dc.ui.QCRejectDialog = dc.ui.Dialog.extend({

  id                : 'qc_reject_dialog',
  className         : 'dialog tempalog',
  template          : null,
  parentTemplate    : null,
  fieldViewList     : [],

  dataEvents : {
      'click .cancel'     : 'close',
      'click .ok'         : 'save'
  },


  constructor : function(document_id) {
    this.document_id    = document_id;
    this.events         = _.extend({}, this.events, this.dataEvents);
    this._mainJST = JST['qc_reject_dialog'];
    _.bindAll(this, 'render');
    dc.ui.Dialog.call(this, {mode : 'custom', title : _.t('reject_de'), saveText : _.t('save') });

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

    //If no selection is made, error
    var selected = $("input[type='radio']:checked").val();
    if( !selected ){
        this.error(_.t('reject_de_not_selected'));
        return false;
    }

    //Trigger save
    $.ajax({
        url         : '/documents/' + this.document_id + '/reject_de',
        contentType : 'application/json; charset=utf-8',
        type        : 'put',
        data        : JSON.stringify({'de': selected}),
        success     : function(response){
          if(window.opener){ window.opener.location.reload(); }
          window.close();
        }
    })
  }

}, {

  // This static method is used for conveniently opening the dialog for
  // any selected template.
  open : function(document_id) {
    new dc.ui.QCRejectDialog(document_id);
  }

});
