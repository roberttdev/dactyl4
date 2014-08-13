dc.ui.ViewerQcDeSubpanel = dc.ui.ViewerBaseControlPanel.extend({

  AnnoClass: FuncUtils.stringToFunction("dc.ui.QCDEAnnotationListing"),

    initialize: function(options) {
        this.el.id = this.el.id + '_' + options['de'];
        this.reloadParams = {de: options['de']};
        dc.ui.ViewerBaseControlPanel.prototype.initialize.apply(this, arguments);
    },


    render : function(annoId) {
        var _deView           = this;
        var _mainJST = JST['qc_de_subpanel'];
        var templateName    = this.model.get('group_template') == null ? null : this.model.get('group_template').name;
        $(this.el).html(_mainJST({template_name: templateName ? templateName.substring(0,39) : null}));

        //Group Navigation
        this.$('.group_navigation').html(this.generateGroupNav());

        //Group Listings
        this.model.children.each(function(model, index){
            _deView.addGroup({
                model: model,
                showEdit: false,
                showDelete: false
            });
        });
        this.$('#group_section').html(_.pluck(this.groupViewList, 'el'));

        //Annotations
        this.model.annotations.each(function(model, index) {
           _annoView = _deView.addDataPoint(model, (model.id == annoId));
           _deView.listenTo(_annoView, 'requestAnnotationClone', _deView.passCloneRequest);
        });
        this.$('#annotation_section').html(_.pluck(this.pointViewList,'el'));

        return this.el;
    },


    //When annotation selected in DV, find a data point that's waiting for DV input or matches the annotation and pass response to it.  If neither,
    //reload to a group that contains a point that matches it
    handleAnnotationSelect: function(anno){
        var _deView = this;

        //If the group selected is this group, find and highlight point; otherwise save and reload proper group
        if( anno.group_id == _deView.model.id ) {
            _view = _.find(this.pointViewList, function(view){ return view.model.id == anno.id; });
            if( _view ){ _view.handleDVSelect(anno); }
        }else {
           _deView.reloadPoints(anno.group_id, anno.id);
        }
    },


    //Listens for an annotation to request to be cloned and passes it to anything
    //listening to events from this control panel
    passCloneRequest: function(anno){
        this.trigger('requestAnnotationClone', anno);
    },


    //If a displayed anno has been removed from QC, update it
    handleRemoveFromQC: function(anno){
        _view = _.find(this.pointViewList, function(view){ return view.model.id == anno.id; });
        if( _view ){ _view.model.set({qc_approved: false}); }
    }

});
