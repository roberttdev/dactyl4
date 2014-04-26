dc.ui.ViewerControlPanel = Backbone.View.extend({

  id : 'control_panel',

  events : {
    'click .set_sections':          'openSectionEditor',
    'click .public_annotation':     'togglePublicAnnotation',
    'click .edit_remove_pages':     'editRemovePages',
    'click .edit_reorder_pages':    'editReorderPages',
    'click .edit_page_text':        'editPageText',
    'click .reprocess_text':        'reprocessText',
    'click .edit_replace_pages':    'editReplacePages',
    'click .toggle_document_info':  'toggleDocumentInfo',
    'click .access_info':           'editAccess'
  },

  initialize : function() {
    var docModel = this._getDocumentModel();
    _.bindAll(this, 'closeDocumentOnAccessChange', 'onDocumentChange', 'render');
    docModel.bind('change:access', this.render);
    docModel.bind('change', this.onDocumentChange);
    this.redactionColor = 'black';
  },

  render : function() {
    var accountProto    = dc.model.Account.prototype;
    var accessWorkspace = dc.account.get('role') == accountProto.ADMINISTRATOR ||
                          dc.account.get('role') == accountProto.CONTRIBUTOR   ||
                          dc.account.get('role') == accountProto.FREELANCER;
    this.viewer         = currentDocument;
    this._page          = this.viewer.$('.DV-textContents');
    var doc             = this._getDocumentModel();
    var docAccess       = doc.get('access');
    $(this.el).html(JST['control_panel']({
      isReviewer      : dc.app.editor.options.isReviewer,
      isOwner         : dc.app.editor.options.isOwner,
      workspacePrefix : accessWorkspace ? '#' : '',
      docAccess       : docAccess,
      orgName         : this.viewer.api.getContributorOrganization()
    }));
    this.showReviewerWelcome();
    return this;
  },

  showReviewerWelcome : function() {
    var inviter = dc.app.editor.options.reviewerInviter;
    if (!(dc.account.get('role') == dc.model.Account.prototype.REVIEWER && inviter)) return;
    var title = _.t('x_invited_to_review_x', inviter.fullName, dc.inflector.truncate(currentDocument.api.getTitle(), 50) );
    var description = JST['reviewer_welcome'](inviter);
    var dialog = dc.ui.Dialog.alert("", {description: description, title: title});
    $(dialog.el).addClass('wide_dialog');
    dialog.center();
  },

  openSectionEditor : function() {
    dc.app.editor.sectionEditor.open();
  },

  prompt : function(title, initialValue, callback, options) {
    dc.ui.Dialog.prompt(title, initialValue, function(value, dialog) {
      if (initialValue != value) return callback(value, dialog);
      return true;
    }, options);
  },

  editAccess : function() {
    Documents.editAccess([this.docModel], this.closeDocumentOnAccessChange);
  },

  closeDocumentOnAccessChange : function() {
    if (this.docModel.hasChanged('access')) {
      this.setOnParent(this.docModel, {access: dc.access.PENDING});
      var closeMessage = _.t('access_level_edit_closing');
      dc.ui.Dialog.alert(closeMessage, {onClose: function(){ window.close(); }});
    }
  },

  onDocumentChange : function(doc) {
    this.viewer.api.setTitle(doc.get('title'));
    this.viewer.api.setSource(doc.get('source'));
    this.viewer.api.setRelatedArticle(doc.get('related_article'));
    this.viewer.api.setPublishedUrl(doc.get('remote_url'));
    this.viewer.api.setDescription(doc.get('description'));
    this.setOnParent(doc, {
      title           : doc.get('title'),
      source          : doc.get('source'),
      related_article : doc.get('related_article'),
      remote_url      : doc.get('remote_url'),
      description     : doc.get('description'),
      access          : doc.get('access'),
      data            : _.clone(doc.get('data'))
    });
    if (doc.hasChanged('access')) {
      this.closeDocumentOnAccessChange();
    }
  },

  reprocessText : function() {
    var self = this;
    var closeMessage = _.t('close_while_text_reprocess');
    var dialog = new dc.ui.Dialog.confirm(_.t('text_reprocess_help'), function() {
      var doc = self._getDocumentModel();
      doc.reprocessText();
      self.setOnParent(doc, {access: dc.access.PENDING});
      $(dialog.el).remove();
      _.defer(dc.ui.Dialog.alert, closeMessage, {onClose: function(){ window.close(); }});
    }, {width: 450});
    var forceEl = $(dialog.make('span', {'class':'force_ocr minibutton dark center_button'}, _.t('force_ocr'))).bind('click', function() {
      var doc = self._getDocumentModel();
      doc.reprocessText(true);
      self.setOnParent(doc, {access: dc.access.PENDING});
      $(dialog.el).remove();
      _.defer(dc.ui.Dialog.alert, closeMessage, {onClose: function(){ window.close(); }});
    });
    dialog.$('.ok').addClass('reprocess').text(_.t('reprocess')).before(forceEl);
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

  editPageText : function() {
    this.openTextTab();
    dc.app.editor.editPageTextEditor.toggle();
  },

  editReplacePages : function() {
    this.openThumbnailsTab();
    dc.app.editor.replacePagesEditor.toggle();
  },

  editRemovePages : function() {
    this.openThumbnailsTab();
    dc.app.editor.removePagesEditor.toggle();
  },

  editReorderPages : function() {
    this.openThumbnailsTab();
    dc.app.editor.reorderPagesEditor.toggle();
  },

  togglePublicAnnotation : function() {
    this.openDocumentTab();
    dc.app.editor.annotationEditor.toggle('public');
  },

  toggleDocumentInfo : function() {
    var showing = $('.edit_document_fields').is(':visible');
    $('.document_fields_container').setMode(showing ? 'hide' : 'show', 'document_fields');
    $('.document_fields_container .toggle').setMode(showing ? 'not' : 'is', 'enabled');
  },

  setOnParent : function(doc, attrs) {
    try {
      var doc = window.opener && window.opener.Documents && window.opener.Documents.get(doc);
      if (doc) doc.set(attrs);
    } catch (e) {
      // Couldn't access the parent window -- it's ok.
    }
  },

  _getDocumentModel : function() {
    if (this.docModel) return this.docModel;
    this.docModel = new dc.model.Document(window.currentDocumentModel);
    this.docModel.viewerEditable   = dc.account.get('isOwner');
    this.docModel.suppressNotifier = true;

    return this.docModel;
  },

  _updateDocument : function(attrs) {
    var doc = this._getDocumentModel();
    doc.save(attrs);
    this.setOnParent(doc, attrs);
  }

});
