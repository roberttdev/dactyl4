dc.ui.BaseAnnotationListing = Backbone.View.extend({

  showDelete:       true,
  waitingForClone:  false,
  showEdit:         false,
  showApprove:      false,
  showReject:       false,
  showNote:         false,
  showMatch:        false,

  className: 'anno_listing_wrapper',

  events : {
      'click .annotation_listing'   : 'prepareForAnnotation',
      'click .clone_item'           : 'prepareForClone',
      'click .delete_item'          : 'confirmDelete'
  },

  initialize : function(options) {
    _.bindAll(this, 'render', 'confirmDelete', 'deletePoint');

    this.group_id = options.group_id;

    //Hide all if graph data
    if( this.model.get('is_graph_data') ){
        this.showGraphData = true;
        this.showDelete = false;
    }

    //Set reference to parent control panel
    this.control_panel = options.control_panel;

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

    if( !this.showGraphData ){ this.$('.graph_data').hide(); }
    if( !this.showDelete ){ this.$('.delete_item').hide(); }
    if( !this.showApprove ){ this.$('.approve_item').hide(); }
    if( !this.showReject ){ this.$('.reject_item').hide(); }
    if( !this.showNote ){ this.$('.point_note').hide(); }
    if( !this.showMatch ){ this.$('.row_match').hide(); }

    return this;
  },


  //Show popup confirming template delete
  confirmDelete: function(event) {
    var _thisView = this;
    if( (!this.model.get('title') || this.model.get('templated')) && !this.model.get('content') ){ this.deletePoint(); }
    else{ dc.ui.Dialog.confirm(_.t('confirm_point_delete'), function(){
      _thisView.deletePoint();
      return true;
    }); }
  },


  deletePoint: function() {
    var _thisView = this;
    dc.app.editor.annotationEditor.close(function() {
      //If close succeeds..
      //Wipe DV side if there is data saved there
      if(_thisView.model.get('highlight_id')){
          dc.app.editor.annotationEditor.deleteHighlight(_thisView.model.get('id'), _thisView.model.get('highlight_id'));
      }
      _thisView.model.destroy({data: {group_id: _thisView.group_id}, processData: true});

      _thisView.trigger('pointDeleted', _thisView, _thisView.model.id);
      $(_thisView.el).remove();
      _thisView.setWaitingForClone(false);
    });
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
    var _thisView = this;
    if( !_thisView.model.get('is_graph_data') ) {
        dc.app.editor.annotationEditor.open(this.model, this.group_id, this.showEdit, function () {
            _thisView.openDocumentTab();
            _thisView.highlight();
        });
    }
  },


  //prepareForClone: close out any active annotating and set self in 'waiting for clone' status
  prepareForClone : function() {
      dc.app.editor.annotationEditor.close();
      this.setWaitingForClone(true);
  },


  //setWaitingForClone: turn setting and highlight on/off
  setWaitingForClone: function(turnOn) {
    if( turnOn ){
      //Clear any existing mid-annotation rows
      this.trigger('requestAnnotationClear');
      this.$el.addClass('copyHighlighting');
    }else{
      this.$el.removeClass('copyHighlighting');
    }
    this.waitingForClone = turnOn;
  },


  //updateAnnotation: take results from Document Viewer and update annotation
  updateAnnotation: function(annoData, success) {
    var _thisView = this;

    if( this.control_panel.isTitleDuplicated(annoData.title, this.model.get('id')) ){
        dc.ui.Dialog.alert(_.t('duplicate_titles', annoData.title));
        return false;
    }else{
        //If title is not duplicate of existing title, update for cloning and save
        this.model.set(annoData);
        this.model.save({},{success: function(model, response){
            _thisView.highlight();
            _thisView.render();

            //Pass along updateAll status with response
            returnData = {
                content     : response,
                type        : 'annotation',
                updateAll   : annoData.updateAll
            };
            if(success){ success.call(_thisView, returnData); }
        }});
        return true;
    }
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
