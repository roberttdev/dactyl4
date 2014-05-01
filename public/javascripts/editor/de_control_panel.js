dc.ui.ViewerDEControlPanel = Backbone.View.extend({

  id :                  'control_panel',
  template_listing:     null,

  events : {
    'click .new_group':     'openCreateGroupDialog',
    'click .group_title':   'changeGroupView',
    'click .group_name': 'changeGroupView'
  },

  initialize : function() {
    var docModel = this._getDocumentModel();
    _.bindAll(this, 'openCreateGroupDialog', 'changeGroupView', 'render');

    this._mainJST = JST['de_control_panel'];

    this.reloadPoints(null);
  },


  render : function() {
    _thisView           = this;
    this.viewer         = currentDocument;
    this._page          = this.viewer.$('.DV-textContents');
    var doc             = this._getDocumentModel();
    var templateName    = this.model.get('group_template') == null ? null : this.model.get('group_template').name;
    $(this.el).html(this._mainJST({template_name: templateName}));

    //Group Navigation
    $('.group_navigation').html(this.generateGroupNav());

    //Group Listings
    this.model.children.each(function(model, index){
        _view = new dc.ui.GroupListing({model: model});
        _view.render();
        $('#group_section').append(_view.el);
    });

    //Annotations
    this.model.annotations.each(function(model, index) {
       _view = new dc.ui.AnnotationListing({model: model});
       _view.render();
       $('#annotation_section').append(_view.el);
    });

    return this;
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


  //reloadPoints: fetch data again and re-render. Expects group ID (null is no group)
  reloadPoints: function(groupId) {
      _thisView = this;
      if( groupId == 0 ){ groupId = null; }
      this.model = new dc.model.Group({document_id: dc.app.editor.docId, id: groupId});
      this.model.fetch({success: _thisView.render});
  },


  //changeGroup: reload navigation to display new group
  changeGroupView: function(event) {
      this.reloadPoints((event.currentTarget.id).replace("group_", ""));
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
  }
});
