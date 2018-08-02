dc.ui.ViewerQCControlPanel = Backbone.View.extend({

    id :                  'control_panel',

    //Initialize: base model for this view is the group that is being displayed
    initialize : function() {
        this.deOneSubpanel = new dc.ui.ViewerQcDeSubpanel({de: 1});
        this.qcSubpanel = new dc.ui.ViewerQcSubpanel();
        this.deTwoSubpanel = new dc.ui.ViewerQcDeSubpanel({de: 2});

        this.listenTo(dc.app.editor.annotationEditor, 'annotationSelected', this.handleAnnotationSelect);
        this.listenTo(dc.app.editor.annotationEditor, 'graphSelected', this.handleGraphSelect);

        this.listenTo(this.deOneSubpanel, 'requestAnnotationClone', this.passAnnoCloneRequest);
        this.listenTo(this.deOneSubpanel, 'requestGroupClone', this.handleGroupCloneRequest);
        this.listenTo(this.deOneSubpanel, 'requestAnnotationMatch', this.handleAnnotationMatchRequest);
        this.listenTo(this.deTwoSubpanel, 'requestAnnotationClone', this.passAnnoCloneRequest);
        this.listenTo(this.deTwoSubpanel, 'requestGroupClone', this.handleGroupCloneRequest);
        this.listenTo(this.deTwoSubpanel, 'requestAnnotationMatch', this.handleAnnotationMatchRequest);
        this.listenTo(this.qcSubpanel, 'removeFromQC', this.handleRemoveFromQC);
        this.listenTo(this.qcSubpanel, 'groupDeleted', this.handleGroupDelete);

        this.render();
    },


    render : function(annoId) {
        var _deView = this;
        var _mainJST = JST['qc_control_panel'];
        $(this.el).html(_mainJST());

        this.$('#de1_view').html(this.deOneSubpanel.el);
        this.$('#qc_view').html(this.qcSubpanel.el);
        this.$('#de2_view').html(this.deTwoSubpanel.el);

        return this;
    },


    handleAnnotationSelect: function(anno) {
        this.deOneSubpanel.clearAnnotations();
        this.deTwoSubpanel.clearAnnotations();
        if( anno.account_id == window.currentDocumentModel.de_one_id ){ this.deOneSubpanel.handleAnnotationSelect(anno); }
        if( anno.account_id == window.currentDocumentModel.de_two_id ){ this.deTwoSubpanel.handleAnnotationSelect(anno); }
    },


    handleGraphSelect: function(graph) {
        if( graph.account_id == window.currentDocumentModel.de_one_id ){ this.deOneSubpanel.handleGraphSelect(graph); }
        if( graph.account_id == window.currentDocumentModel.de_two_id ){ this.deTwoSubpanel.handleGraphSelect(graph); }
        if( graph.account_id == dc.account.id ){ this.qcSubpanel.handleGraphSelect(graph); }
    },


    //When one panel requests an annotation's match be displayed, update other panel
    handleAnnotationMatchRequest: function(anno, de_requester) {
        if( de_requester == 1 ){ this.deTwoSubpanel.handleMatchRequest(anno); }
        if( de_requester == 2 ){ this.deOneSubpanel.handleMatchRequest(anno); }
    },


    //Hear clone request from DE panel; create anno in QC panel
    passAnnoCloneRequest: function(annos, group_id, backup, de_requester){
        var thisView = this;
        var failedTitleString = "";
        for(var i=0; i < annos.length; i++) {
            if (this.qcSubpanel.approveDEPoint(annos[i], group_id)) {
                dc.app.editor.annotationEditor.markApproval(annos[i].get('highlight_id'), annos[i].id, 'annotation', true);
            }else{
                failedTitleString += "<br>\'" + annos[i].get('title') + "\'";
            }
        }

        if(failedTitleString.length > 0){ dc.ui.Dialog.alert(_.t('duplicate_titles_fail', failedTitleString)); }
        else{
            if(backup) {
                if (de_requester == 1) { thisView.deOneSubpanel.handleApprovalSuccess(); }
                if (de_requester == 2) { thisView.deTwoSubpanel.handleApprovalSuccess(); }
                thisView.qcSubpanel.handleApprovalSuccess();
            }
        }
    },


    //Pass along group clone request and reload this view to cloned group
    handleGroupCloneRequest: function(group) {
        var _thisView = this;
        var _success = function(response){
            if(_graph_clone){
                //If graph..
                _thisView.qcSubpanel.reloadPoints(response.group_id, null, false);
                newContent = response;
                newContent.type = 'graph';
                //Add QC graph, update approval status of DE graph
                dc.app.editor.annotationEditor.addContentToHighlight(newContent.highlight_id, newContent, false);
                dc.app.editor.annotationEditor.markApproval(newContent.highlight_id, newContent.based_on, 'graph', true);
            }else{
               //If group..
                _thisView.qcSubpanel.reloadPoints(response.id);
            }
        };

        var _error = function(response){
            //If error, display
            dc.ui.Dialog.alert(JSON.parse(response.responseText).errorText);
        };

        var _graph_clone = group.get('is_graph_group') || group.get('is_graph_data');

        //If this is graph subgroup, and not cloning into a main graph group, error
        if(group.get('is_graph_data') && !this.qcSubpanel.model.get('is_graph_group')){
            dc.ui.Dialog.alert(_.t('graph_subgroup_clone_error'));
            return false;
        }else{
            group.clone(this.qcSubpanel.model.id, _success, _error, _graph_clone);
        }
    },


    //If anno is passed, have DV show it as unapproved.  Refresh DE views.
    handleRemoveFromQC: function(anno, group_id){
        if( anno ){ dc.app.editor.annotationEditor.markApproval(anno.get('highlight_id'), anno.get('based_on'), 'annotation', false); }
        this.refreshDE(anno);
    },


    handleGroupDelete: function(group){
        //If graph group, update DV
        if(group.get('based_on')){
            dc.app.editor.annotationEditor.markApproval(group.get('highlight_id'), group.get('based_on'), 'graph', false);
        }

        //If graph data, update parent graph JSON in DV
        if(group.get('is_graph_data')){
            var qc_model = this.qcSubpanel.model;
            qc_model.fetch();
            var updateHash = {
                type: 'graph',
                content: {
                    highlight_id: qc_model.get('highlight_id'),
                    id: qc_model.get('graph_id'),
                    graph_json: qc_model.get('graph_json')
                }
            }
            dc.app.editor.annotationEditor.syncDV(updateHash);
        }

        this.refreshDE();
    },


    //Refresh DE views
    refreshDE: function(){
        this.deOneSubpanel.reloadCurrent(false);
        this.deTwoSubpanel.reloadCurrent(false);
    }
});
