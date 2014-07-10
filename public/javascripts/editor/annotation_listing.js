dc.ui.AnnotationListing = Backbone.View.extend({

  waitingForClone: false,

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
    _thisView           = this;
    $(this.el).html(this._mainJST({
        annotation_id:  this.model.id,
        title:          this.model.get('title') ? this.model.get('title').substring(0,49) : '(no title)',
        content:        this.model.get('content') ? this.model.get('content').substring(0,49) : ''
    }));

    if( this.model.get('location') ){
        this.$('.clone_item').hide();
        this.$('.annotation_status').removeClass('incomplete');
        this.$('.annotation_status').addClass('complete');
    }

    return this;
  },


  //Show popup confirming template delete
  confirmDelete: function(event) {
      dc.ui.Dialog.confirm(_.t('confirm_point_delete'), this.deletePoint);
  },


  deletePoint: function() {
      dc.app.editor.annotationEditor.deleteAnnotation(this.model, this.group_id);
      this.model.destroy({data:{group_id: this.group_id}, processData: true});
      $(this.el).remove();
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

      dc.app.editor.annotationEditor.open(this.model, this.group_id);
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


  //handleDVSelect: receive selected annotation data from DV, and process it based on status
  handleDVSelect: function(anno) {
      //If expecting a clone, delete this to make way for clone.  Otherwise, highlight
      if(this.waitingForClone) { this.deletePoint(); }else{ this.highlight(); }
  },


  highlight: function() {
      //Clear any existing mid-annotation rows
      this.trigger('requestAnnotationClear');

      this.$el.addClass('highlighting');
  }

});
