dc.ui.ViewerDEControlPanel = Backbone.View.extend({

  id :                  'control_panel',
  template_listing:     null,
  pointViewList:        null,
  groupViewList:        null,
  changed:             false,

  events : {
    'click .new_group':         'openCreateGroupDialog',
    'click .new_data':          'createNewDataPoint',
    'click .group_title':       'changeGroupView',
    'click .group_name':        'changeGroupView'
  },

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
    $(this.el).html(this._mainJST({template_name: templateName}));

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

    //If there are annotations on-screen, and data has changed, handle them..
    if( this.changed && $('.annotation_listing').length > 0 ) {
        this.clearChanged();
        this.model.annotations.pushAll({success: function(){
            _deView.syncDV(success)
        }});
    }
    else {
        //If not, just pass along to success function
        success.call();
    }
  },


  addGroup: function(model) {
      _view = new dc.ui.GroupListing({model: model});
      this.groupViewList.push(_view);
      _view.render();
      return _view;
  },

  //model: Annotation, highlight: boolean
  addDataPoint: function(model, highlight) {
      _view = new dc.ui.AnnotationListing({model: model});
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
      _newGroup.once('sync', function(){ this.reloadPoints(_thisView.model.id); }, this);
      dc.ui.CreateGroupDialog.open(_newGroup);
  },


  createNewDataPoint: function() {
      _point = new dc.model.Annotation({group_id: this.model.id, document_id: this.model.get('document_id'), templated: false});
      this.model.annotations.add(_point);
      _view = this.addDataPoint(_point);
      _view.prepareForAnnotation();
      $('#annotation_section').append(_view.$el);
  },


  //reloadPoints: fetch data again and re-render. Expects group ID (null is no group)
  //annotationId is optional; will highlight that if exists
  reloadPoints: function(groupId, annotationId) {
      _thisView = this;

      //Clear
      this.groupViewList = [];
      this.pointViewList = [];
      this.clearChanged();
      this.stopListening(undefined, 'requestAnnotationClear');

      if( groupId == 0 ){ groupId = null; }
      this.model = new dc.model.Group({document_id: dc.app.editor.docId, id: groupId});
      this.model.fetch({success: function(){
          _thisView.render(annotationId);
      }});
  },


  //changeGroup: reload navigation to display new group
  changeGroupView: function(event) {
      _thisView = this;
      dc.app.editor.annotationEditor.hideActiveAnnotations();
      dc.app.editor.annotationEditor.close();
      this.save(function(){
          _thisView.reloadPoints((event.currentTarget.id).replace("group_", ""));
      });
  },


  //generateGroupNav: recursive function
  generateGroupNav: function() {
      _ancestry = this.model.get('ancestry');
      returnStr = "<span class='group_title' id='0'>Home</span>";
      if (_ancestry != null) {
          $.each(_ancestry, function (index, ancestor) {
              returnStr += "&nbsp;>&nbsp<span class='group_title' id='group_" + ancestor.id + "'>" + ancestor.name + "</span>";
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
      this.markChanged();
  },


  //When annotation selected, display point in UI and select it as well
  handleAnnotationSelect: function(anno){
    _deView = this;
    if( anno.id ){
        _decpView = this;
        _view = _.find(this.pointViewList, function(view){ return view.model.id == anno.id; });
        if( _view ) {
            _view.highlight();
        }else{
            //If not in current list, save any changes and reload proper group
           this.save(function() {
               _deView.reloadPoints(anno.group_id, anno.id);
           });
        }
    }else{
        _view = _.find(this.pointViewList, function(view){ return view.model.get('location') == anno.location; });
        _view.highlight();
    }
  },


  //Pass annotation data to DV, to sync
  syncDV: function(success) {
      dc.app.editor.annotationEditor.syncDV(this.model.annotations);
      success.call();
  },


  //Set indicator that data has changed
  markChanged: function() {
      this.changed = true;
  },


  clearChanged: function() {
      this.changed = false;
  }
});
