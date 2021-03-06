dc.ui.QARejectDialog = dc.ui.Dialog.extend({

  id                : 'qa_reject_dialog',
  className         : 'dialog tempalog',
  template          : null,
  parentTemplate    : null,
  fieldViewList     : [],

  dataEvents : {
      'click .cancel'     : 'close',
      'click .ok'         : 'save'
  },


  constructor : function(anno, is_group, success) {
    this.annotation   = anno;
    this.is_group = is_group;
    this.success = success;
    this.events         = _.extend({}, this.events, this.dataEvents);
    this._mainJST = JST['qa_reject_dialog'];
    _.bindAll(this, 'render');
    dc.ui.Dialog.call(this, {mode : 'custom', title : _.t('reject_point'), saveText : _.t('save') });

    _thisView = this;

    this.render();

    $(document.body).append(this.el);
  },


  render : function() {
    //Base dialog object needs
    dc.ui.Dialog.prototype.render.call(this);
    this._container = this.$('.custom');

    //Main template
    this._container.html(this._mainJST({
      qa_point_note: this.annotation.get('qa_reject_note') ? this.annotation.get('qa_reject_note') : '',
      is_group: this.is_group
    }));

    return this;
  },


  save : function(success) {
    var qa_note = $('#qa_point_note').val();
    var subitems_too = $('#subitems_too') ? $('#subitems_too').is(':checked') : false;

    //If no note is entered, error
    if( qa_note.length <= 0 ){
        this.error(_.t('blank_note_error'));
        return false;
    }

    this.annotation.set({approved: true, qa_reject_note: qa_note});
    this.success.call(this, subitems_too);
    this.close();
  }

}, {

  // This static method is used for conveniently opening the dialog for
  // any selected template.
  open : function(anno, is_group, success) {
    new dc.ui.QARejectDialog(anno, is_group, success);
  }

});
