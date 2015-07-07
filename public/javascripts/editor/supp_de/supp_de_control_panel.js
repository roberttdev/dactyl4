dc.ui.ViewerSuppDEControlPanel = dc.ui.ViewerDEControlPanel.extend({

  AnnoClass: FuncUtils.stringToFunction("dc.ui.SuppDEAnnotationListing"),

    initialize: function(options) {
      dc.ui.ViewerDEControlPanel.prototype.initialize.apply(this, arguments);

      _.bindAll(this, 'releaseFileNote');

      this.noteList = new dc.model.FileNotes({document_id: this.docModel.id});
      this.noteList.fetch();
    },

    render : function(annoId) {
      var _deView           = this;
      var _mainJST = JST['supp_de_control_panel'];
      var templateName    = this.model.get('group_template') == null ? null : this.model.get('group_template').name;
      $(this.el).html(_mainJST({template_name: templateName ? templateName.substring(0,39) : null}));

      //Group Navigation
      $('.group_navigation').html(this.generateGroupNav());

      //Group Listings
      this.model.children.each(function(model, index){
        can_edit = !model.get('approved');
        _grp = _deView.addGroup({
          model: model,
          showClone: true,
          showEdit: can_edit ,
          showDelete: can_edit,
          showApproval: false,
          showApprovalStatus: true,
          strikethrough: !(model.get('qa_reject_note') == null)
        });
      });
      $('#group_section').html(_.pluck(this.groupViewList, 'el'));

      //Annotations
      this.model.annotations.each(function(model, index) {
         _deView.addDataPoint(model, (model.id == annoId));
      });
      $('#annotation_section').html(_.pluck(this.pointViewList,'el'));

      return this;
    },


    //Save: save all valid data point changes if no errors
    save: function(success) {
      var _deView = this;

      //Clear error class from all inputs
      $('input').removeClass('error');
      var _hasErrors = false;

      //Check for duplicate annotation titles.  If found, throw error and exit
      var titleList = [];
      for(var i=0; i < this.pointViewList.length; i++){
        if( this.pointViewList[i].model.get('qa_reject_note') == null ) {
          if ($.inArray(this.pointViewList[i].model.get('title'), titleList) > 0) {
            dc.ui.Dialog.alert(_.t('duplicate_titles', this.pointViewList[i].model.get('title')));
            return false;
          } else {
            titleList.push(this.pointViewList[i].model.get('title'));
          }
        }
      }

      //Remove any blank points
      this.model.annotations.each(function(model, index) {
          if(model.get('title') == null && model.get('content') == null){ _deView.model.annotations.remove(model); }
      });

      //If there are non-blank annotations, attempt to sync them with DB.
      if( this.model.annotations.length > 0 ) {
          this.model.annotations.pushAll({success: function(){
              _deView.syncDV(success)
          }});
      }
      else {
          //If not, just pass along to success function
          success.call();
      }
    },


    //When annotation selected in DV, find a data point that's waiting for DV input or matches the annotation and pass response to it.  If neither,
    //reload to a group that contains a point that matches it
    handleAnnotationSelect: function(anno){
      var _deView = this;
      //If previously saved point (has ID assigned)..
      if( anno.id ){
          //If a data point is waiting for a clone response, pass response, then create copy
          var _view = _.find(this.pointViewList, function(view){ return view.waitingForClone; });
          if( _view ) {
              //First check that another anno with the same title doesn't exist; if so, prompt
              var _dupeView = _.find(this.pointViewList, function(view){ return (anno.title == view.model.get('title')) && !view.waitingForClone });
              if( _dupeView ){
                  dc.ui.Dialog.confirm(_.t('duplicate_point_error'), function(){
                      _dupeView.deletePoint();
                      _deView.replacePoint(anno, _view);
                      dc.app.editor.annotationEditor.syncGroupAssociation(anno.id, _deView.model.id);
                      return true;
                  },{
                      onCancel: function(){ dc.app.editor.annotationEditor.hideActiveAnnotations(); }
                  });
              }else {
                  _deView.replacePoint(anno, _view);
                  dc.app.editor.annotationEditor.syncGroupAssociation(anno.id, this.model.id);
              }
          }else{
              //If the group selected is this group, find and highlight point; otherwise save and reload proper group
              if( anno.groups[0].group_id == _deView.model.id ) {
                  _view = _.find(this.pointViewList, function(view){ return view.model.id == anno.id; });
                  if( _view ){ _view.highlight(); }
              }else {
                  this.save(function () {
                      _deView.reloadPoints(anno.groups[0].group_id, anno.id);
                  });
              }
          }
      }else{
          _view = _.find(this.pointViewList, function(view){ return view.model.get('location') == anno.location; });
          _view.highlight(anno);
      }
    },


    handleFileNote: function() {
        if( !this.fileNoteDialog ){
          this.fileNoteDialog = new dc.ui.FileNoteDialog(this.docModel, this.noteList, this.releaseFileNote, true);
          this.listenTo(this.fileNoteDialog, 'requestPointReload', this.handleReloadRequest);
        }
    },


    //Function to trigger that file note dialog is gone
    releaseFileNote: function() {
        this.fileNoteDialog = null;
    },


    handleReloadRequest: function(annoGroupInfo) {
      var _thisView = this;
      this.save(function () {
        _thisView.reloadPoints(annoGroupInfo.group_id, annoGroupInfo.id, true);
      });
    },


    //Overload for create new point; don't allow in rejected group
    createNewDataPoint: function() {
      if( this.model.get('qa_reject_note') ){
        dc.ui.Dialog.alert(_.t('create_in_rejected_group'));
      }else {
        dc.ui.ViewerDEControlPanel.prototype.createNewDataPoint.call(this);
      }
    }

});
