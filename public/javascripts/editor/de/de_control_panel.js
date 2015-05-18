dc.ui.ViewerDEControlPanel = dc.ui.ViewerBaseControlPanel.extend({

  AnnoClass: FuncUtils.stringToFunction("dc.ui.DEAnnotationListing"),


  initialize: function(options) {
      //Listen for annotation selects and adjust UI accordingly
      this.listenTo(dc.app.editor.annotationEditor, 'annotationSelected', this.handleAnnotationSelect);
      this.listenTo(dc.app.editor.annotationEditor, 'annotationCancelled', this.handleAnnotationCancel);

      _.bindAll(this, 'handleMarkCompleteError')

      dc.ui.ViewerBaseControlPanel.prototype.initialize.apply(this, arguments);
  },


  render : function(annoId) {
    var _deView           = this;
    var _mainJST = JST['de_control_panel'];
    var templateName    = this.model.get('group_template') == null ? null : this.model.get('group_template').name;
    $(this.el).html(_mainJST({
      template_name: templateName ? templateName.substring(0,39) : null,
      help_url: this.model.get('help_url')
    }));

    //Group Navigation
    $('.group_navigation').html(this.generateGroupNav());

    //Group Listings
    this.model.children.each(function(model, index){
        _deView.addGroup({
            model: model,
            showStatus: false
        });
    });
    $('#group_section').html(_.pluck(this.groupViewList, 'el'));

    //Annotations
    this.model.annotations.each(function(model, index) {
       var _view = _deView.addDataPoint(model, (model.id == annoId));
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
        if( $.inArray(this.pointViewList[i].model.get('title'), titleList) > -1 ){
            dc.ui.Dialog.alert(_.t('duplicate_titles', this.pointViewList[i].model.get('title')));
            return false;
        }else{
            titleList.push(this.pointViewList[i].model.get('title'));
        }
    }

    //Remove any blank points
    this.model.annotations.remove(this.model.annotations.where({title: (null || undefined), content: (null || undefined)}));

    //If there are non-blank annotations, attempt to sync them with DB.
    if( this.model.annotations.length > 0 ) {
      //Hide annotations/check for unfinished annotations in DV; if successful, save
      dc.app.editor.annotationEditor.hideActiveAnnotations(function(){
        _deView.model.annotations.pushAll({success: function(){
          _deView.syncDV(success)
        }});
      });
    }
    else {
        //If not, just double check for unfinished annotations in DV, then pass along to success function
      dc.app.editor.annotationEditor.hideActiveAnnotations(function(){ success.call(); });
    }
  },


  //Override for adding a data point.. adds additional listener
  addDataPoint: function(model, highlight){
    var _view = dc.ui.ViewerBaseControlPanel.prototype.addDataPoint.apply(this, [model, highlight]);
    this.listenTo(_view, 'pointDeleted', this.handlePointDelete);
    return _view;
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
              if( anno.group_id == _deView.model.id ) {
                  _view = _.find(this.pointViewList, function(view){ return view.model.id == anno.id; });
                  if( _view ){ _view.highlight(); }
              }else {
                  this.save(function () {
                      _deView.reloadPoints(anno.group_id, anno.id);
                  });
              }
          }
      }else{
          _view = _.find(this.pointViewList, function(view){ return view.model.get('location') == anno.location; });
          _view.highlight(anno);
      }
  },


  handleAnnotationCancel: function() {
    this.clearAnnotations();
  },


  handleGroupCloneRequest: function(group) {
    var _thisView = this;
    var _cloningDialog = dc.ui.Dialog.progress('Cloning..');
    group.clone(this.model.id, function(){
      _cloningDialog.close();
      _thisView.reloadPoints(_thisView.model.id);
    });
  },


  handleGroupDelete: function(group){
      this.reloadAnnotations();
  },


  handlePointDelete: function(annoView){
    //Manually remove model from collection if it's still there.. as extra protection due to the fact that the anno id/anno group id dichotomy confuses model.destroy
    for(i=0; i < this.model.annotations.length; i++){
      if( this.model.annotations.at(i) == annoView.model ){
        this.model.annotations.remove(this.model.annotations.at(i));
        break;
      }
    }

    //Remove view from tracking
    this.pointViewList = this.pointViewList.filter(function (val) { return val != annoView; });
  },


  //markComplete: If confirmed, save current data and send request to mark complete; handle error if not able to mark complete
  markComplete: function() {
      _thisView = this;
      dc.ui.Dialog.confirm(_.t('confirm_mark_complete'), function(){
          _thisView.save(function() {
              _thisView.docModel.markComplete({
                  success: function() {
                    if(window.opener){ window.opener.location.reload(); }
                    window.close();
                  },
                  error: _thisView.handleMarkCompleteError
              });
          });
          return true;
      });
  },

  //handleMarkCompleteError: If error returned from attempted mark complete, notify and highlight field
  handleMarkCompleteError: function(responseData) {
      this.reloadPoints(responseData.data.group_id, responseData.data.id);
      dc.ui.Dialog.alert(responseData.errorText);
  }

});
