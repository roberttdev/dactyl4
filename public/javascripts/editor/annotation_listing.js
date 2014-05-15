dc.ui.AnnotationListing = Backbone.View.extend({

  events : {
      'click .annotation_listing': 'prepareForAnnotation',
      'click .delete_item': 'confirmDelete'
  },

  initialize : function() {
    _.bindAll(this, 'render', 'confirmDelete', 'deletePoint');

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
      dc.app.editor.annotationEditor.deleteAnnotation(this.model);
      this.model.destroy();
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


  //prepareForAnnotation: create highlight to tie to data point
  prepareForAnnotation : function() {
      this.openDocumentTab();
      this.highlight();

      this.listenToOnce(dc.app.editor.annotationEditor, 'updateAnnotation', this.updateAnnotation);
      dc.app.editor.annotationEditor.open(this.model);
  },


  //updateAnnotation: take results from Document Viewer and update annotation
  updateAnnotation: function(annoData) {
    this.model.set(annoData);
    this.render();
  },


  //clearAnnotation: Clear mid-annotation state if currently in it
  clearAnnotation: function() {
      this.$el.removeClass('highlighting');
      this.stopListening(dc.app.editor.annotationEditor, 'updateAnnotation');
  },


  highlight: function() {
      //Clear any existing mid-annotation rows
      this.trigger('requestAnnotationClear');

      this.$el.addClass('highlighting');
  }

});
