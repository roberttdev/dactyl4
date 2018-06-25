dc.ui.ViewerDEControlPanel = dc.ui.ViewerBaseControlPanel.extend({

    AnnoClass: FuncUtils.stringToFunction("dc.ui.DEAnnotationListing"),
    GroupClass: FuncUtils.stringToFunction("dc.ui.DEGroupListing"),


    initialize: function(options) {
        //Listen for annotation selects and adjust UI accordingly
        this.listenTo(dc.app.editor.annotationEditor, 'annotationSelected', this.handleAnnotationSelect);
        this.listenTo(dc.app.editor.annotationEditor, 'graphSelected', this.handleGraphSelect);
        this.listenTo(dc.app.editor.annotationEditor, 'highlightCancelled', this.handleAnnotationCancel);
        this.listenTo(dc.app.editor.annotationEditor, 'cloneConfirmed', this.handleCloneConfirm);

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


    //Save: clear all unfinished business before reloading the control panel view
    save: function(success) {
        var _deView = this;

        //Clear error class from all inputs
        $('input').removeClass('error');

        //Remove any blank points
        this.model.annotations.remove(this.model.annotations.where({title: (null || undefined), content: (null || undefined)}));

        //Double check for unfinished annotations in DV, then pass along to success function
        dc.app.editor.annotationEditor.hideActiveHighlights(function(){ success.call(); });
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
          if( anno.id ) {
              //Check if anyone is waiting on a clone response
              var _view = _.find(this.pointViewList, function (view) {
                  return view.waitingForClone;
              });

              if (_view) {
                  //If waiting for clone, and there is only one title+text represented on highlight, treat as clone confirm
                  //Otherwise, do nothing (wait for confirm)
                  if(!anno.multiple_anno_data){ _deView.handleCloneConfirm(anno); }
                  else{ dc.app.editor.annotationEditor.requestCloneConfirm(true); }
              }else{
                  //If no one is waiting for clone..
                  //If the group selected is this group, find and highlight point; otherwise save and reload proper group
                  if (anno.group_id == _deView.model.id) {
                      _view = _.find(this.pointViewList, function (view) {
                          return view.model.id == anno.id;
                      });
                      if (_view) {
                          _view.highlight();
                      }
                  } else {
                      this.save(function () {
                          _deView.reloadPoints(anno.group_id, anno.id);
                      });
                  }
              }
          }else{
              _view = _.find(this.pointViewList, function(view){ return !view.model.get('id'); });
              _view.highlight(anno);
          }
      },


    //When clone is confirmed in DV, clone
    handleCloneConfirm: function(anno) {
        //Attempt to update the anno waiting for a clone.  If it succeeds, tell DV to update
        var _view = _.find(this.pointViewList, function (view) {
            return view.waitingForClone;
        });

        if(_view) {
            //Remove original ID/group info; clone rest
            delete anno.id;
            delete anno.group_id;
            _view.updateAnnotation(anno, function(){
                var annoContent = {
                    type: 'annotation',
                    id: _view.model.id,
                    document_id: _view.model.get('document_id'),
                    group_id: _view.model.get('group_id'),
                    title: _view.model.get('title'),
                    text: _view.model.get('content')
                };

                dc.app.editor.annotationEditor.addContentToHighlight(_view.model.get('highlight_id'), annoContent);
            });
        }
    },

    handleGraphSelect: function(graph){
        this.reloadPoints(graph.group_id);
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
        this.reloadHighlights();
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
        var _thisView = this;
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
