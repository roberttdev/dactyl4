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
        'click .new_graph':         'createGraph',
        'click .drop_claim':        'dropClaim',
        'click .mark_complete':     'markComplete',
        'click .group_title':       'handleGroupClick',
        'click .group_name':        'handleGroupClick',
        'click .file_note':         'handleFileNote',
        'click .help_url_icon':     'launchHelpWindow'
    },


    //Initialize: base model for this view is the group that is being displayed
    initialize : function(options) {
        var docModel = this._getDocumentModel();
        this.viewer         = currentDocument;

        //If standard opening process, refresh opener to update list
        if(window.opener){ window.opener.location.reload(); }

        //Mark as changed when any update request is fired
        this.listenTo(dc.app.editor.annotationEditor, 'updateAnnotation', this.delegateUpdate);

        this.reloadPoints(null);
    },


    //Placeholder save function; just calls success.  Override for children
    save: function(success) {
        success();
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
        if(options['showDelete'] != false){ this.listenTo(_view, 'groupDeleted', function(group){ this.handleGroupDelete(group) }); }
        if(options['showClone'] != false){ this.listenTo(_view, 'requestGroupClone', function(group){ this.handleGroupCloneRequest(group); }); }
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
        dc.app.editor.annotationEditor.close(function(){
          _thisView.save(function(){
            _thisView.reloadPoints(id);
          });
        });
    },


    //generateGroupNav: recursive function
    generateGroupNav: function() {
        var _ancestry = this.model.get('ancestry');
        returnStr = "";
        if (_ancestry != null) {
            $.each(_ancestry, function (index, ancestor) {
                groupName = ancestor.extension ? ancestor.name + '[' + ancestor.extension + ']' : ancestor.name;
                if( returnStr != "" ){ returnStr += " > "; }
                returnStr += "<span class='group_title' id='group_" + ancestor.id + "'>" + groupName + "</span>";
            });
        }

        return returnStr;
    },


    //reloadPoints: fetch data again and re-render. Expects group ID (null is no group)
    //annotationId is optional; will highlight that if exists
    //based_on: If true, get the group/anno based on the passed values instead
    reloadPoints: function(groupId, annotationId) {
        var _thisView = this;

        //Clear
        this.groupViewList = [];
        this.pointViewList = [];
        this.stopListening(undefined, 'requestAnnotationClear');

        var requestParams = this.reloadParams;

        if( groupId == 0 ){ groupId = null; }
        this.model = new dc.model.Group({document_id: dc.app.editor.docId, id: groupId});
        this.model.fetch({
            data:    $.param(requestParams),
            success: function(){
              dc.app.editor.annotationEditor.setRecommendations(_thisView.model.get('template_fields'));
              _thisView.render(annotationId);
            }
        });
    },


    //reloadCurrent: request reload of current group
    reloadCurrent: function(){
        this.reloadPoints(this.model.id);
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
        this.stopListening(dc.app.editor.annotationEditor, 'updateAnnotation', this.openGraphDialog);

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
        var _point = new dc.model.Annotation({group_id: this.model.id, document_id: this.model.get('document_id'), templated: false});
        this.model.annotations.add(_point);
        var _view = this.addDataPoint(_point);
        _view.prepareForAnnotation();
        $('#annotation_section').append(_view.$el);
    },


    createDataPointCopy: function(anno) {
        var _point = new dc.model.Annotation(anno);
        _point.set({group_id: this.model.id}); //Update group id, and in process mark as changed
        this.model.annotations.add(_point);
        var _view = this.addDataPoint(_point);
        this.$('#annotation_section').append(_view.$el);
        return _view;
    },


    createGraph: function() {
      var _thisView = this;

      _thisView.clearAnnotations();

      //Trigger annotation for graph
      dc.app.editor.annotationEditor.open(
          this.model,
          this.group_id,
          false,
          function() {},
          'graph'
      );
    },


    //Clone 'anno', replacing AnnotationView 'replace'
    replacePoint: function(anno, replace) {
        replace.deletePoint();
        this.createDataPointCopy(anno);
    },


    //delegateUpdate: When request to update received, find proper view and instruct it to update
    delegateUpdate: function(anno){
        _view = _.find(this.pointViewList, function(view){ return view.$el.hasClass('highlighting'); });
        _view.updateAnnotation(anno);
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
            _thisView.docModel.dropClaim({success: function(){
              if(window.opener){ window.opener.location.reload(); }
              window.close();
            }});
        });
    },

    //hasTitle: Returns whether an annotation with this title already exists
    hasTitle: function(title) {
        for(var i=0; i < this.pointViewList.length; i++){
            if( this.pointViewList[i].model.get('title') == title ){ return true; }
        }
        return false;
    },

    //launchHelpWindow: Open Help URL in separate window
    launchHelpWindow: function(){
      if( this.model.get('group_template') ){ window.open(this.model.get('group_template').help_url); }
    },

    //markComplete: blank placeholder to be overridden if class wishes to handle mark complete
    markComplete: function() {
        alert('Error: Control Panel implementation has not written mark complete handler!');
    },

    //handleCloneRequest: blank placeholder to be overridden if class wishes to handle cloning
    handleGroupCloneRequest: function(group) {
        alert('Error: Control Panel implementation has not written clone handler!');
    },

    //handleGroupDelete: blank placeholder to be overridden if class wishes to handle group deletes
    handleGroupDelete: function(group) {
        alert('Error: Control Panel implementation has not written delete handler!');
    },

    //handleFileNote: blank placeholder to be overridden if class wishes to handle file notes
    handleFileNote: function(group) {
        alert('Error: Control Panel implementation has not written file note handler!');
    }
});