dc.ui.ViewerDEControlPanel = Backbone.View.extend({

  id :                  'control_panel',
  template_listing:     null,
  pointViewList:        null,
  groupViewList:        null,

  events : {
    'click .new_group':         'openCreateGroupDialog',
    'click .new_data':          'createNewDataPoint',
    'click .save_exit':         'saveAndExit',
    'click .drop_claim':        'dropClaim',
    'click .group_title':       'handleGroupClick',
    'click .group_name':        'handleGroupClick'
  },

  //Initialize: base model for this view is the group that is being displayed
  initialize : function() {
    var docModel = this._getDocumentModel();
    this.viewer         = currentDocument;
    _.bindAll(this, 'openCreateGroupDialog', 'changeGroupView', 'createNewDataPoint', 'render', 'save', 'reloadPoints');

    //Mark as changed when any update request is fired
    this.listenTo(dc.app.editor.annotationEditor, 'updateAnnotation', this.delegateUpdate);

    //Listen for annotation selects and adjust UI accordingly
    this.listenTo(dc.app.editor.annotationEditor, 'annotationSelected', this.handleAnnotationSelect);

    this._mainJST = JST['de_control_panel'];

    this.reloadPoints(null);
  },


  render : function(annoId) {
    _deView           = this;
    var templateName    = this.model.get('group_template') == null ? null : this.model.get('group_template').name;
    $(this.el).html(this._mainJST({template_name: templateName ? templateName.substring(0,39) : null}));

    //Group Navigation
    $('.group_navigation').html(this.generateGroupNav());

    //Group Listings
    this.model.children.each(function(model, index){
        _deView.addGroup(model);
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


  saveAndExit: function(){
    this.save(window.close());
  },


  addGroup: function(model) {
      _view = new dc.ui.GroupListing({model: model});
      this.groupViewList.push(_view);
      _view.render();
      this.listenTo(_view, 'reloadAnnotationsRequest', this.reloadAnnotations);
      this.listenTo(_view, 'reloadPointsRequest', function(){ this.reloadPoints(this.model.id); });
      return _view;
  },


  //model: Annotation, highlight: boolean
  addDataPoint: function(model, highlight) {
      _view = new dc.ui.AnnotationListing({model: model, group_id: this.model.id});
      this.pointViewList.push(_view);
      _view.render();

      if(highlight){ _view.highlight(); }

      this.listenTo(_view, 'requestAnnotationClear', this.clearAnnotations);

      return _view;
  },


  openTextTab : function() {
    if (this.viewer.state != 'ViewText') {
        this.viewer.open('ViewText');
    }
  },


  openThumbnailsTab : function() {
    if (this.viewer.state != 'ViewThumbnails') {
        this.viewer.open('ViewThumbnails');
    }
  },


  openDocumentTab : function() {
    if (this.viewer.state != 'ViewDocument') {
        this.viewer.open('ViewDocument');
    }
  },


  togglePublicAnnotation : function() {
    this.openDocumentTab();
    dc.app.editor.annotationEditor.toggle('public');
  },


  _getDocumentModel : function() {
    if (this.docModel) return this.docModel;
    this.docModel = new dc.model.Document(window.currentDocumentModel);
    this.docModel.viewerEditable   = dc.account.get('isOwner');
    this.docModel.suppressNotifier = true;

    return this.docModel;
  },


  openCreateGroupDialog: function() {
      _thisView = this;
      _newGroup = new dc.model.Group({parent_id: this.model.id, document_id: this.model.get('document_id')});
      _newGroup.once('sync', function(){ this.changeGroupView(_thisView.model.id); }, this);
      dc.ui.CreateGroupDialog.open(_newGroup);
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


  //reloadPoints: fetch data again and re-render. Expects group ID (null is no group)
  //annotationId is optional; will highlight that if exists
  reloadPoints: function(groupId, annotationId) {
      _thisView = this;

      //Clear
      this.groupViewList = [];
      this.pointViewList = [];
      this.stopListening(undefined, 'requestAnnotationClear');

      if( groupId == 0 ){ groupId = null; }
      this.model = new dc.model.Group({document_id: dc.app.editor.docId, id: groupId});
      this.model.fetch({success: function(){
          _thisView.render(annotationId);
      }});
  },


  //handleGroupClick: receive group click and activate nav change
  handleGroupClick: function(event) {
      this.changeGroupView((event.currentTarget.id).replace("group_", ""));
  },


  //changeGroup: reload navigation to display new group
  changeGroupView: function(id) {
      _thisView = this;
      dc.app.editor.annotationEditor.hideActiveAnnotations();
      dc.app.editor.annotationEditor.close();
      this.save(function(){
          _thisView.reloadPoints(id);
      });
  },


  //generateGroupNav: recursive function
  generateGroupNav: function() {
      _ancestry = this.model.get('ancestry');
      returnStr = "<span class='group_title' id='0'>Home</span>";
      if (_ancestry != null) {
          $.each(_ancestry, function (index, ancestor) {
              groupName = ancestor.extension ? ancestor.name + '[' + ancestor.extension + ']' : ancestor.name;
              returnStr += " > <span class='group_title' id='group_" + ancestor.id + "'>" + groupName + "</span>";
          });
      }

      return returnStr;
  },


  //Clear mid-annotation state for all annotations
  clearAnnotations: function(){
      $.each(this.pointViewList, function(index, view) {
          view.clearAnnotation();
      });
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


  //dropClaim: If confirmed, return file to pool and remove all work from this user on this status
  dropClaim: function(success) {
      _thisView = this;
      dc.ui.Dialog.confirm(_.t('confirm_drop_claim'), function(){
          _thisView.docModel.dropClaim({success: window.close});
      });
  },


  //Pull all annotations for the document and reload the DV with them
  reloadAnnotations: function(){
    annos = new dc.model.Annotations({document_id: this.model.get('document_id')});
    annos.getAll({success: function(response){
        dc.app.editor.annotationEditor.reloadAnnotations(response);
    }});
  }

});
