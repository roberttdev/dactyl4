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
    if( !this.fileNoteDialog ){
      this.fileNoteDialog = new dc.ui.FileNoteDialog(this.docModel, this.noteList, this.releaseFileNote);
      this.listenTo(this.fileNoteDialog, 'requestPointReload', this.handleReloadRequest);
    }
  },


  handleReloadRequest: function(annoGroupInfo) {
    this.trigger('requestOriginalDEReload', annoGroupInfo.group_id, annoGroupInfo.annotation_id);
  }
});
