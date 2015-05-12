dc.ui.ViewerSuppQcSubpanel = dc.ui.ViewerQcSubpanel.extend({

  initialize: function(options) {
    dc.ui.ViewerQcSubpanel.prototype.initialize.apply(this, arguments);

    this.noteList = new dc.model.FileNotes({document_id: this.docModel.id});
    this.noteList.fetch();
  },


  render: function() {
    dc.ui.ViewerQcSubpanel.prototype.render.apply(this, arguments);

    this.$('.file_note').show();
  },


  handleFileNote: function() {
    var _thisView = this;
    if( !this.fileNoteDialog ){
      this.fileNoteDialog = new dc.ui.FileNoteDialog(
          this.docModel,
          this.noteList,
          function(){
            _thisView.fileNoteDialog = null;
          },
          false);
      this.listenTo(this.fileNoteDialog, 'requestPointReload', this.handleReloadRequest);
    }
  },


  handleReloadRequest: function(annoGroupInfo) {
    this.trigger('requestOriginalDEReload', annoGroupInfo.group_id, annoGroupInfo.annotation_id);
  },


  //Send document back to Supp DE
  rejectDE: function(){
    var _thisView = this;
    dc.ui.Dialog.confirm(_.t('reject_supp_de_text'), function(){
      $.ajax({
        url         : '/documents/' + _thisView.docModel.id + '/reject_de',
        contentType : 'application/json; charset=utf-8',
        type        : 'put',
        data        : JSON.stringify({'de': '1'}),
        success     : function(response){ window.close(); }
      });
    });
  },


  //Handle click of 'mark complete' button
  markComplete: function(){
    var _thisView = this;
    this.save(function(){ dc.ui.QCCompleteDialog.open(_thisView.docModel, true); });
  },
});
