dc.ui.ViewerBaseControlPanel = Backbone.View.extend({
    id :                  'control_panel',
    template_listing:     null,
    pointViewList:        null,
    groupViewList:        null,

    //****Commonly overridden properties
    //AnnoClass: class of annotation to create
    AnnoClass:            FuncUtils.stringToFunction("dc.ui.BaseAnnotationListing"),
    //groupParam: params to pass when reloading data
    reloadParams:           {},

    events : {
        'click .new_group':         'openCreateGroupDialog',
        'click .new_data':          'createNewDataPoint',
        'click .save_exit':         'saveAndExit',
        'click .drop_claim':        'dropClaim',
        'click .mark_complete':     'markComplete',
        'click .group_title':       'handleGroupClick',
        'click .group_name':        'handleGroupClick'
    },


    //Initialize: base model for this view is the group that is being displayed
    initialize : function(options) {
        var docModel = this._getDocumentModel();
        this.viewer         = currentDocument;

        //Mark as changed when any update request is fired
        this.listenTo(dc.app.editor.annotationEditor, 'updateAnnotation', this.delegateUpdate);

        //Listen for annotation selects and adjust UI accordingly
        this.listenTo(dc.app.editor.annotationEditor, 'annotationSelected', this.handleAnnotationSelect);

        this.reloadPoints(null);
    },


    _getDocumentModel : function() {
        if (this.docModel) return this.docModel;
        this.docModel = new dc.model.Document(window.currentDocumentModel);
        this.docModel.viewerEditable   = dc.account.get('isOwner');
        this.docModel.suppressNotifier = true;

        return this.docModel;
    },


    //Initialize group view and store.  Allow for listening of reload requests
    addGroup: function(options) {
        var _view = new dc.ui.GroupListing(options);
        this.groupViewList.push(_view);
        _view.render();
        this.listenTo(_view, 'reloadAnnotationsRequest', this.reloadAnnotations);
        this.listenTo(_view, 'reloadPointsRequest', function(){ this.reloadPoints(this.model.id); });
        return _view;
    },


    openCreateGroupDialog: function() {
        var _thisView = this;
        var _newGroup = new dc.model.Group({parent_id: this.model.id, document_id: this.model.get('document_id')});
        _newGroup.once('sync', function(model){ this.changeGroupView(model.id); }, this);
        dc.ui.CreateGroupDialog.open(_newGroup);
    },


    //handleGroupClick: receive group click and activate nav change
    handleGroupClick: function(event) {
        this.changeGroupView((event.currentTarget.id).replace("group_", ""));
    },


    //changeGroup: reload navigation to display new group
    changeGroupView: function(id) {
        var _thisView = this;
        dc.app.editor.annotationEditor.hideActiveAnnotations();
        dc.app.editor.annotationEditor.close();
        this.save(function(){
            _thisView.reloadPoints(id);
        });
    },


    //generateGroupNav: recursive function
    generateGroupNav: function() {
        var _ancestry = this.model.get('ancestry');
        returnStr = "<span class='group_title' id='0'>Home</span>";
        if (_ancestry != null) {
            $.each(_ancestry, function (index, ancestor) {
                groupName = ancestor.extension ? ancestor.name + '[' + ancestor.extension + ']' : ancestor.name;
                returnStr += " > <span class='group_title' id='group_" + ancestor.id + "'>" + groupName + "</span>";
            });
        }

        return returnStr;
    },


    //reloadPoints: fetch data again and re-render. Expects group ID (null is no group)
    //annotationId is optional; will highlight that if exists
    reloadPoints: function(groupId, annotationId) {
        var _thisView = this;

        //Clear
        this.groupViewList = [];
        this.pointViewList = [];
        this.stopListening(undefined, 'requestAnnotationClear');

        if( groupId == 0 ){ groupId = null; }
        this.model = new dc.model.Group({document_id: dc.app.editor.docId, id: groupId});
        this.model.fetch({
            data:    $.param(this.reloadParams),
            success: function(){ _thisView.render(annotationId); }
        });
    },


    //Pull all annotations for the document and reload the DV with them
    reloadAnnotations: function(){
        var _annos = new dc.model.Annotations({document_id: this.model.get('document_id')});
        _annos.getAll({success: function(response){
            dc.app.editor.annotationEditor.reloadAnnotations(response);
        }});
    },


    //Clear mid-annotation state for all annotations
    clearAnnotations: function(){
        $.each(this.pointViewList, function(index, view) {
            view.clearAnnotation();
        });
    },


    //model: Annotation, highlight: boolean
    addDataPoint: function(model, highlight) {
        _view = new this.AnnoClass({model: model, group_id: this.model.id});
        this.pointViewList.push(_view);
        _view.render();

        if(highlight){ _view.highlight(); }

        this.listenTo(_view, 'requestAnnotationClear', this.clearAnnotations);

        return _view;
    },


    createNewDataPoint: function() {
        _point = new dc.model.Annotation({group_id: this.model.id, document_id: this.model.get('document_id'), templated: false});
        this.model.annotations.add(_point);
        _view = this.addDataPoint(_point);
        _view.prepareForAnnotation();
        $('#annotation_section').append(_view.$el);
    },


    createDataPointCopy: function(anno) {
        _point = new dc.model.Annotation(anno);
        _point.set('group_id', this.model.id); //Update group id, and in process mark as changed
        this.model.annotations.add(_point);
        _view = this.addDataPoint(_point);
        $('#annotation_section').append(_view.$el);
        dc.app.editor.annotationEditor.syncGroupAssociation(anno.id, _deView.model.id);
    },


    //delegateUpdate: When request to update received, find proper view and instruct it to update
    delegateUpdate: function(anno){
        _view = _.find(this.pointViewList, function(view){ return view.$el.hasClass('highlighting'); });
        _view.updateAnnotation(anno);
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
            }else{
                //If the group selected is this group, find and highlight point; otherwise save and reload proper group
                if( anno.group_id == _deView.model.id ) {
                    _view = _.find(this.pointViewList, function(view){ return view.model.id == anno.id; });
                    _view.handleDVSelect(anno);
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
    },


    //Pass annotation data to DV, to sync
    syncDV: function(success) {
        dc.app.editor.annotationEditor.syncDV(this.model.annotations, this.model.id);
        success.call();
    },


    //React to request to Save & Exit
    saveAndExit: function(){
        this.save(window.close);
    },


    //dropClaim: If confirmed, return file to pool and remove all work from this user on this status
    dropClaim: function(success) {
        _thisView = this;
        dc.ui.Dialog.confirm(_.t('confirm_drop_claim'), function(){
            _thisView.docModel.dropClaim({success: window.close});
        });
    },


    //markComplete: If confirmed, save current data and send request to mark complete; handle error if not able to mark complete
    markComplete: function() {
        _thisView = this;
        dc.ui.Dialog.confirm(_.t('confirm_mark_complete'), function(){
            _thisView.save(function() {
                _thisView.docModel.markComplete({
                    success: window.close,
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