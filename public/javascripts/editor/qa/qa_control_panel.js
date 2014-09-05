dc.ui.ViewerQAControlPanel = dc.ui.ViewerBaseControlPanel.extend({

    id :                  'control_panel',
    AnnoClass:            FuncUtils.stringToFunction("dc.ui.QAAnnotationListing"),

    //Initialize: base model for this view is the group that is being displayed
    initialize : function() {
    dc.ui.ViewerBaseControlPanel.prototype.initialize.apply(this, arguments);

    this.listenTo(dc.app.editor.annotationEditor, 'annotationSelected', this.handleAnnotationSelect);
    },


    render : function(annoId) {
      var _deView           = this;
      var _mainJST = JST['qa_control_panel'];
      var templateName    = this.model.get('group_template') == null ? null : this.model.get('group_template').name;
      $(this.el).html(_mainJST({template_name: templateName ? templateName.substring(0,39) : null}));

      //Group Navigation
      this.$('.group_navigation').html(this.generateGroupNav());

      //Group Listings
      this.model.children.each(function(model, index){
          _deView.addGroup({
              model: model,
              showClone: false,
              showEdit: false,
              showDelete: false,
              complete: (model.get('unapproved_count') == 0)
          });
      });
      this.$('#group_section').html(_.pluck(this.groupViewList, 'el'));

      //Annotations
      this.model.annotations.each(function(model, index) {
          _anno = _deView.addDataPoint(model, (model.id == annoId));
          _deView.listenTo(_anno, 'removeFromQC', _deView.passRemoveFromQC);
      });
      this.$('#annotation_section').html(_.pluck(this.pointViewList,'el'));

      return this.el;
    },


    //Save: save all valid data point changes if no errors
    save: function(success) {
        var _deView = this;

        this.model.annotations.pushAll({success: success});
    },


    //When annotation selected in DV, find a data point that's waiting for DV input or matches the annotation and pass response to it.  If neither,
    //reload to a group that contains a point that matches it
    handleAnnotationSelect: function(anno){
        var _deView = this;

        //If the group selected is this group, find and highlight point; otherwise save and reload proper group
        _view = _.find(this.pointViewList, function(view){ return view.model.id == anno.id; });
        if( _view ){
            _view.highlight();
        }else {
            this.save(function () {
                _deView.reloadPoints(anno.group_id, anno.id);
            });
        }
    }
});
