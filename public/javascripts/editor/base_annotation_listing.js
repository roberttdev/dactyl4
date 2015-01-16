dc.ui.BaseAnnotationListing = Backbone.View.extend({

  waitingForClone:  false,
  showEdit:         false,
  showApprove:      false,
  showReject:       false,
  showNote:         false,

  events : {
      'click .annotation_listing'   : 'prepareForAnnotation',
      'click .clone_item'           : 'prepareForClone',
      'click .delete_item'          : 'confirmDelete'
  },

  initialize : function(options) {
    _.bindAll(this, 'render', 'confirmDelete', 'deletePoint');

    this.group_id = options.group_id;

    this._mainJST = JST['annotation_listing'];
  },


  render : function() {
    var _thisView           = this;

    var _title = this.model.get('title') ? this.model.get('title') : '(no title)';
    var _content = this.model.get('content') ? this.model.get('content') : '';

    //Trimming
    if( _title.length > 50 ){ _title = _title.substring(0,45) + "[...]"; }
    if( _content.length > 50 ){ _content = _content.substring(0,45) + "[...]"; }

    $(this.el).html(this._mainJST({
        annotation_id:  this.model.id,
        title:          _title,
        content:        _content
    }));

    if( !this.showApprove ){ this.$('.approve_item').hide(); }
    if( !this.showReject ){ this.$('.reject_item').hide(); }
    if( !this.showNote ){ this.$('.point_note').hide(); }

    return this;
  },


  //Show popup confirming template delete
  confirmDelete: function(event) {
      if( (!this.model.get('title') || this.model.get('templated')) && !this.model.get('content') ){ this.deletePoint(); }
      else{ dc.ui.Dialog.confirm(_.t('confirm_point_delete'), this.deletePoint); }
  },


  deletePoint: function() {
    dc.app.editor.annotationEditor.deleteAnnotation(this.model, this.group_id);
    if( this.model.get('annotation_group_id') ) {
      //If this has been saved before, initiate deletion from DB
      this.model.destroy({data: {group_id: this.group_id}, processData: true});
    }
    this.trigger('pointDeleted', this, this.model.id);
    $(this.el).remove();
    this.setWaitingForClone(false);
    return true;
  },


  openDocumentTab : function() {
      //Mark as changed when any update request is fired
      this.listenToOnce(dc.app.editor.annotationEditor, 'updateAnnotation', this.updateAnnotation);

      if (currentDocument.state != 'ViewDocument') {
          currentDocument.open('ViewDocument');
      }
  },


  //prepareForAnnotation: signal DV to create annotation and wait for response
  prepareForAnnotation : function() {
      this.openDocumentTab();
      this.highlight();

      dc.app.editor.annotationEditor.open(this.model, this.group_id, this.showEdit);
  },


  //prepareForClone: close out any active annotating and set self in 'waiting for clone' status
  prepareForClone : function() {
      dc.app.editor.annotationEditor.close();
      this.setWaitingForClone(true);
  },


  //setWaitingForClone: turn setting and highlight on/off
  setWaitingForClone: function(turnOn) {
      this.waitingForClone = turnOn;
      turnOn ? this.$el.addClass('copyHighlighting') : this.$el.removeClass('copyHighlighting');
  },


  //updateAnnotation: take results from Document Viewer and update annotation
  updateAnnotation: function(annoData) {
    this.model.set(annoData);
    this.clearAnnotation();
    this.render();
  },


  //clearAnnotation: Clear any mid-annotation state if currently in it
  clearAnnotation: function() {
      this.$el.removeClass('highlighting');
      this.stopListening(dc.app.editor.annotationEditor, 'updateAnnotation');
      this.setWaitingForClone(false);
  },


  highlight: function() {
      //Clear any existing mid-annotation rows
      this.trigger('requestAnnotationClear');

      this.$el.addClass('highlighting');
  }

});
