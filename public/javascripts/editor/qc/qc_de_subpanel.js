dc.ui.ViewerQcDeSubpanel = dc.ui.ViewerBaseControlPanel.extend({

  AnnoClass: FuncUtils.stringToFunction("dc.ui.QCDEAnnotationListing"),

    initialize: function(options) {
        this.el.id = this.el.id + '_' + options['de'];
        this.reloadParams = {de: options['de']};
        dc.ui.ViewerBaseControlPanel.prototype.initialize.apply(this, arguments);

        this.events['click .approve_all'] = 'approveAll';
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
                showDelete: false,
                complete: (model.get('unapproved_count') == 0)
            });
        });
        this.$('#group_section').html(_.pluck(this.groupViewList, 'el'));

        //Annotations
        this.model.annotations.each(function(model, index) {
           _annoView = _deView.addDataPoint(model, (model.id == annoId));
           _deView.listenTo(_annoView, 'requestAnnotationClone', _deView.passAnnoCloneRequest);
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
            if( _view ){ _view.highlight(); }
        }else {
           _deView.reloadPoints(anno.group_id, anno.id);
        }
    },


    //Listens for an annotation to request to be cloned and passes it to anything
    //listening to events from this control panel
    passAnnoCloneRequest: function(anno){
        this.trigger('requestAnnotationClone', anno, this.model.id);
    },


    //Request approval/clone for all current annotations
    approveAll: function(anno){
        var _thisView = this;
        this.model.annotations.each(function(model, index) {
            _thisView.passAnnoCloneRequest(model);
        });
    },


    //Pass along group clone request and reload this view to cloned group
    handleGroupCloneRequest: function(group) {
        this.trigger('requestGroupClone', group);
        this.reloadPoints(group.id);
    },


    //If a displayed anno has been removed from QC, update it
    handleRemoveFromQC: function(anno){
        _view = _.find(this.pointViewList, function(view){ return view.model.id == anno.id; });
        if( _view ){ _view.model.set({approved: false}); }
    }

});