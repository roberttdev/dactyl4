dc.ui.ViewerDEControlPanel = dc.ui.ViewerBaseControlPanel.extend({

  AnnoClass: FuncUtils.stringToFunction("dc.ui.DEAnnotationListing"),


  initialize: function(options) {
      //Listen for annotation selects and adjust UI accordingly
      this.listenTo(dc.app.editor.annotationEditor, 'annotationSelected', this.handleAnnotationSelect);

      dc.ui.ViewerBaseControlPanel.prototype.initialize.apply(this, arguments);
  },


  render : function(annoId) {
    var _deView           = this;
    var _mainJST = JST['de_control_panel'];
    var templateName    = this.model.get('group_template') == null ? null : this.model.get('group_template').name;
    $(this.el).html(_mainJST({template_name: templateName ? templateName.substring(0,39) : null}));

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
       _deView.addDataPoint(model, (model.id == annoId));
    });
    $('#annotation_section').html(_.pluck(this.pointViewList,'el'));

    return this;
  },


  //Save: save all valid data point changes if no errors
  save: function(success) {
    _deView = this;

    //Clear error class from all inputs
    $('input').removeClass('error');
    _hasErrors = false;

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
      _deView = this;
      if( anno.id ){
          //If a data point is waiting for a clone response, pass response, then create copy
          _view = _.find(this.pointViewList, function(view){ return view.waitingForClone; });
          if( _view ) {
              _view.handleDVSelect(anno);
              _deView.createDataPointCopy(anno);
              dc.app.editor.annotationEditor.syncGroupAssociation(anno.id, _deView.model.id);
          }else{
              //If the group selected is this group, find and highlight point; otherwise save and reload proper group
              if( anno.group_id == _deView.model.id ) {
                  _view = _.find(this.pointViewList, function(view){ return view.model.id == anno.id; });
                  if( _view ){ _view.handleDVSelect(anno); }
              }else {
                  this.save(function () {
                      _deView.reloadPoints(anno.group_id, anno.id);
                  });
              }
          }
      }else{
          _view = _.find(this.pointViewList, function(view){ return view.model.get('location') == anno.location; });
          _view.handleDVSelect(anno);
      }
  }

});
