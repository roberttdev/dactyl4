dc.ui.EditorToolbar = Backbone.View.extend({

  className : 'editor_toolbar interface',

  constructor: function() {
    Backbone.View.apply(this, arguments);
    this.modes = {};
    this.viewer = currentDocument;
    this.imageUrl = this.viewer.schema.document.resources.page.image;
  },

  toggle : function() {
    if (this.modes.open == 'is') {
      this.close();
      this.showSelectedThumbnail();
    } else {
      dc.app.editor.closeAllEditors();
      this.open();
    }
  },
  
  showSelectedThumbnail : function() {
    $('.DV-thumbnail.DV-originallySelected').removeClass('DV-originallySelected').addClass('DV-selected');
  },
  
  hideSelectedThumbnail : function() {
    $('.DV-thumbnail.DV-selected').removeClass('DV-selected').addClass('DV-originallySelected');
  }

});
dc.ui.BaseAnnotationListing = Backbone.View.extend({

  showDelete:       true,
  waitingForClone:  false,
  showEdit:         false,
  showApprove:      false,
  showReject:       false,
  showNote:         false,
  showMatch:        false,

  className: 'anno_listing_wrapper',

  events : {
      'click .annotation_listing'   : 'prepareForAnnotation',
      'click .clone_item'           : 'prepareForClone',
      'click .delete_item'          : 'confirmDelete'
  },

  initialize : function(options) {
    _.bindAll(this, 'render', 'confirmDelete', 'deletePoint');

    this.group_id = options.group_id;

    //Hide all if graph data
    if( this.model.get('is_graph_data') ){
        this.showGraphData = true;
        this.showDelete = false;
    }

    this._mainJST = JST['annotation_listing'];
  },


  render : function() {
    var _thisView           = this;

    var _title = this.model.get('title') ? this.model.get('title') : '(no title)';
    var _content = this.model.get('content') ? this.model.get('content') : '';

    //Trimming
    if( _title.length > 50 ){ _title = _title.substring(0,45) + "[...]"; }
    if( _content.length > 50 ){ _content = _content.substring(0,45) + "[...]"; }

    $(this.el).html(this._mainJST({
        annotation_id:  this.model.id,
        title:          _title,
        content:        _content
    }));

    if( !this.showGraphData ){ this.$('.graph_data').hide(); }
    if( !this.showDelete ){ this.$('.delete_item').hide(); }
    if( !this.showApprove ){ this.$('.approve_item').hide(); }
    if( !this.showReject ){ this.$('.reject_item').hide(); }
    if( !this.showNote ){ this.$('.point_note').hide(); }
    if( !this.showMatch ){ this.$('.row_match').hide(); }

    return this;
  },


  //Show popup confirming template delete
  confirmDelete: function(event) {
    var _thisView = this;
    if( (!this.model.get('title') || this.model.get('templated')) && !this.model.get('content') ){ this.deletePoint(); }
    else{ dc.ui.Dialog.confirm(_.t('confirm_point_delete'), function(){
      _thisView.deletePoint();
      return true;
    }); }
  },


  deletePoint: function() {
    var _thisView = this;
    dc.app.editor.annotationEditor.close(function() {
      //If close succeeds, continue
      dc.app.editor.annotationEditor.deleteAnnotation(_thisView.model, _thisView.group_id);
      if( _thisView.model.get('annotation_group_id') ) {
        //If this has been saved before, initiate deletion from DB.  Must check ag_id first, as this is the relevant one (as opposed to 'id' that Backbone uses, which is anno id to sync w/ DV)
        _thisView.model.destroy({data: {group_id: _thisView.group_id}, processData: true});
      }
      _thisView.trigger('pointDeleted', _thisView, _thisView.model.id);
      $(_thisView.el).remove();
      _thisView.setWaitingForClone(false);
    });
  },


  openDocumentTab : function() {
      //Mark as changed when any update request is fired
      this.listenToOnce(dc.app.editor.annotationEditor, 'updateAnnotation', this.updateAnnotation);

      if (currentDocument.state != 'ViewDocument') {
          currentDocument.open('ViewDocument');
      }
  },


  //prepareForAnnotation: signal DV to create annotation and wait for response
  prepareForAnnotation : function() {
    var _thisView = this;
    dc.app.editor.annotationEditor.open(this.model, this.group_id, this.showEdit, function(){
      _thisView.openDocumentTab();
      _thisView.highlight();
    });
  },


  //prepareForClone: close out any active annotating and set self in 'waiting for clone' status
  prepareForClone : function() {
      dc.app.editor.annotationEditor.close();
      this.setWaitingForClone(true);
  },


  //setWaitingForClone: turn setting and highlight on/off
  setWaitingForClone: function(turnOn) {
    if( turnOn ){
      //Clear any existing mid-annotation rows
      this.trigger('requestAnnotationClear');
      this.$el.addClass('copyHighlighting');
    }else{
      this.$el.removeClass('copyHighlighting');
    }
    this.waitingForClone = turnOn;
  },


  //updateAnnotation: take results from Document Viewer and update annotation
  updateAnnotation: function(annoData) {
    this.model.set(annoData);
    this.clearAnnotation();
    this.render();
  },


  //clearAnnotation: Clear any mid-annotation state if currently in it
  clearAnnotation: function() {
      this.$el.removeClass('highlighting');
      this.stopListening(dc.app.editor.annotationEditor, 'updateAnnotation');
      this.setWaitingForClone(false);
  },


  highlight: function() {
      //Clear any existing mid-annotation rows
      this.trigger('requestAnnotationClear');

      this.$el.addClass('highlighting');
  }

});

dc.ui.BaseGroupListing = Backbone.View.extend({

  showStatus: true,
  showEdit: true,
  showDelete: true,
  showClone: true,
  showApproval: false,
  showApprovalStatus: false,
  showReject: false,
  showNote: false,
  complete: false,
  strikethrough: false,

  events : {
    'click .edit_group'   : 'openEditGroupDialog',
    'click .delete_group' : 'confirmDelete',
    'click .clone_item'   : 'cloneGroup',
    'click .approve_item' : 'approveGroup',
    'click .reject_item'  : 'rejectGroup',
    'click .point_note'   : 'openNote'
  },

  initialize : function(options) {
    _.bindAll(this, 'render', 'confirmDelete', 'deleteGroup', 'openEditGroupDialog', 'cloneGroup', 'approveGroup', 'rejectGroup',
        'openNote', 'setApprove', 'setReject');

    this.model.on("change", this.render);

    this.showSubitemStatus = options.showSubitemStatus != null ? options.showSubitemStatus : false;
    this.complete = options.complete != null ? options.complete : false;
    this.showEdit = options.showEdit != null ? options.showEdit : true;
    this.showDelete = options.showDelete != null ? options.showDelete : true;
    this.showClone = options.showClone != null ? options.showClone : true;
    this.showApproval = options.showApproval != null ? options.showApproval : false;
    this.showApprovalStatus = options.showApprovalStatus != null ? options.showApprovalStatus : false;
    this.showNote = options.showNote != null ? options.showNote : false;
    this.strikethrough = options.strikethrough != null ? options.strikethrough : false;
    this.showGraphData = this.model.get("is_graph_data") || this.model.get("is_graph_group");

    this._mainJST = JST.group_listing;
  },


  render : function() {
    _thisView = this;
    $(this.el).html(_thisView._mainJST({
        group_id:   this.model.id,
        name:       this.model.get("extension") ? this.model.get("name") + "[" + this.model.get("extension") + "]" : this.model.get("name")
    }));

    if( !this.showGraphData ){ this.$(".graph_data").hide(); }
    if( !this.showSubitemStatus ){ this.$(".subitem_status").hide(); }
    if( !this.showEdit ){ this.$(".edit_group").hide(); }
    if( !this.showDelete ){ this.$(".delete_item").hide(); }
    if( !this.showClone ){ this.$(".clone_item").hide(); }
    if( !this.showNote ){ this.$(".point_note").hide(); }
    if( !this.showApprovalStatus ){ this.$(".row_status").hide(); }
    if( !this.showApproval ){
      this.$(".approve_item").hide();
      this.$(".reject_item").hide();
    }

    if( this.showSubitemStatus && this.model.get("unapproved_count") == 0 ){
        this.$(".subitem_status").removeClass("incomplete");
        this.$(".subitem_status").addClass("complete");
    } else {
        this.$(".subitem_status").removeClass("complete");
        this.$(".subitem_status").addClass("incomplete");
    }

    if( (this.showApproval || this.showApprovalStatus) && this.model.get("qa_approved_by") ){
      this.model.get("qa_reject_note") ? this.setReject() : this.setApprove();
    }

    if( this.strikethrough ){ this.$(".group_listing").addClass("rejected"); }

    return this;
  },


  openEditGroupDialog: function() {
    dc.ui.CreateGroupDialog.open(this.model);
  },


  //Show popup confirming template delete
  confirmDelete: function(event) {
    dc.ui.Dialog.confirm(_.t("confirm_group_delete"), this.deleteGroup);
  },


  deleteGroup: function() {
    _thisView = this;
    this.model.destroy({success: function() {
        $(_thisView.el).remove();
        _thisView.trigger("groupDeleted");
    }});
    return true;
  },


  cloneGroup: function() {
    this.trigger("requestGroupClone", this.model);
  },

  approveGroup: function() {
    var _thisView = this;
    this.model.set({approved: true, qa_reject_note: null});
    this.model.update_approval(false, _thisView.setApprove);
  },

  rejectGroup: function() {
    var _thisView = this;
    dc.ui.QARejectDialog.open(_thisView.model, true, function(subitems_too){
        _thisView.model.update_approval(subitems_too, _thisView.setReject);
    });
  },

  openNote: function() {
    var _thisView = this;
    dc.ui.QARejectDialog.open(_thisView.model, true, function(subitems_too){
        _thisView.model.update_approval(subitems_too);
    });
  },

  //setApprove: Sets UI to approved
  setApprove: function(){
    this.$(".approve_item").hide();
    this.$(".point_note").hide();
    this.$(".row_status").removeClass("incomplete");
    this.$(".row_status").removeClass("rejected");
    this.$(".row_status").addClass("complete");
    if( this.showApproval ){ this.$(".reject_item").show().css("display", "inline-block"); }
  },


  //setReject: Sets UI to rejected
  setReject: function(){
    this.$(".reject_item").hide();
    this.$(".row_status").removeClass("complete");
    this.$(".row_status").removeClass("incomplete");
    this.$(".row_status").addClass("rejected");
    if( this.showApproval ){ this.$(".approve_item").show().css("display", "inline-block"); }
    if( this.showApproval ){ this.$(".point_note").show().css("display", "inline-block"); }
  }

});

dc.ui.AnnotationEditor = Backbone.View.extend({

  id : 'annotation_editor',

  events : {
    'click .close': 'close'
  },

  initialize: function(options) {
    this._kind = 'public';
    // track open/close state
    this._open    = false;
    // track state of what is being highlighted
    this._highlight_type = null;
    // cache of button DOM elements
    this._buttons = {};
    // Annotation endpoint.
    this._baseURL = '/documents/' + dc.app.editor.docId + '/annotations';
    this._inserts = $('.DV-pageNoteInsert');
    // list of positions to redact.
    this.redactions = [];

    // cache references to elements
    this._buttons['public'] = $('#control_panel .public_annotation');
    this.pages          = $('.DV-pages');
    this.page           = $('.DV-page');
    this._guide         = $('#public_note_guide');

    _.bindAll(this, 'open', 'close', 'drawAnnotation', 'saveAnnotation', 'passCancelNotification',
      'deleteAnnotation', 'selectAnnotationPoint', 'createPageNote');
    currentDocument.api.onAnnotationSave(this.saveAnnotation);
    currentDocument.api.onAnnotationSelect(this.selectAnnotationPoint);
    currentDocument.api.onAnnotationCancel(this.passCancelNotification);
    this._inserts.click(this.createPageNote);
  },

  open : function(annotation, groupId, showEdit, success, highlight_type) {
    //Request to hide existing annos; if succeeds, continue and call success function
    var _me = this;
    this.hideActiveAnnotations(function(){
      //If annotation already has location, just show it
      if( annotation.get('location') ){ return _me.showAnnotation(annotation, showEdit); }

      if (annotation != null) {
        annotation.groups = [{group_id: groupId, approved_count: 0}];
        _me._active_annotation = annotation;
      }

      _me._open = true;
      _me.redactions = [];
      _me._highlight_type = highlight_type == 'graph' ? 'graph' : 'annotation';
      _me.page.css({cursor: 'crosshair'});
      _me._inserts.filter('.visible').show().addClass('DV-public');

      // Start drawing region when user mousedown
      _me.page.unbind('mousedown', _me.drawAnnotation);
      _me.page.bind('mousedown', _me.drawAnnotation);
      $(document).unbind('keydown', _me.close);
      $(document).bind('keydown', _me.close);

      //Show notification that annotation mode is on
      $('.annotation_notice').show();

      $(document.body).setMode('public', 'editing');
      _me._buttons['public'].addClass('open');
      _me._guide.fadeIn('fast');
      success.call();
    });
  },

  close : function(success) {
    var _me = this;
    this._open = false;
    this._active_annotation = null;
    this._highlight_type = null;
    this.hideActiveAnnotations(function(){
      $('.annotation_notice').hide();
      _me.page.css({cursor : ''});
      _me.page.unbind('mousedown', _me.drawAnnotation);
      $(document).unbind('keydown', _me.close);
      _me.clearAnnotation();
      _me._inserts.hide().removeClass('DV-public DV-private');
      $(document.body).setMode(null, 'editing');
      _me._buttons['public'].removeClass('open');
      _me._guide.hide();
      if(success){ success.call(); }
    });
  },

  toggle : function(kind) {
    if (this._open) {
      this.close();
      if (kind === this._kind) return;
    }
    this.open(this._kind = kind);
  },

  clearAnnotation : function() {
    if (this.region) $(this.region).remove();
  },

  clearRedactions : function() {
    $('.DV-annotationRegion.DV-accessRedact').remove();
  },

  // When a page note insert line is clicked, create a page annotation above
  // the corresponding page.
  createPageNote : function(e) {
    this.close();
    var set = $(e.target).closest('.DV-set');
    var pageNumber = currentDocument.api.getPageNumberForId(set.attr('data-id'));
    currentDocument.api.addAnnotation({
      page            : pageNumber,
      unsaved         : true,
      access          : this._kind || 'public',
      owns_note       : true
    });
  },

  // TODO: Clean up!
  drawAnnotation : function(e) {
    _annotation = this._active_annotation;
    e.stopPropagation();
    e.preventDefault();
    this._activePage = $(e.currentTarget);
    // not sure why this isn't just currentDocument.api.getPageNumber
    this._activePageNumber = currentDocument.api.getPageNumberForId($(this._activePage).closest('.DV-set').attr('data-id'));
    this.clearAnnotation(); // close any open annotation.

    // Record the page boundaries and the starting position for the click+drag
    var offTop        = this._activePage.offset().top,
        offLeft       = this._activePage.offset().left,
        xStart        = e.pageX - offLeft,
        yStart        = e.pageY - offTop,
        borderBottom  = this._activePage.height() - 6,
        borderRight   = this._activePage.width() - 6;

    // Create a div to represent the highlighted region
    this.region = this.make('div', {'class' : 'DV-annotationRegion active ' + this._accessClass(this._kind), style:'position:absolute;'});
    (this._kind == 'redact' ? this._specificPage() : this._activePage).append(this.region);

    var contained = function(e) {
      return e.pageX > 0 && e.pageX < borderRight &&
             e.pageY > 0 && e.pageY < borderBottom;
    };
    var coords = function(e) {
      var x = e.pageX - offLeft - 3,
          y = e.pageY - offTop - 3;
      // keep ending position for drag in bounds
      x = x < 0 ? 0 : (x > borderRight ? borderRight : x);
      y = y < 0 ? 0 : (y > borderBottom ? borderBottom : y);
      return {
        left    : Math.min(xStart, x),
        top     : Math.min(yStart, y),
        width   : Math.abs(x - xStart),
        height  : Math.abs(y - yStart)
      };
    };

    // set the highlighted region's boundaries
    $(this.region).css(coords(e));
    // and continue to update the region's boundaries when the mouse moves.
    var drag = _.bind(function(e) {
      $(this.region).css(coords(e));
      return false;
    }, this);
    this.pages.on('mousemove', drag);

    // when drag is finished
    var dragEnd = _.bind(function(e) {
      // clean up event listeners
      $(document).unbind('keydown', this.close);
      this.pages.unbind('mouseup', dragEnd).unbind('mousemove', drag);

      // calculate highlighted region's dimensions
      var loc     = coords(e);
      loc.left    -= 1;
      loc.top     -= 1;
      loc.right   = loc.left + loc.width;
      loc.bottom  = loc.top + loc.height;
      if (this._kind != 'redact') {
        loc.top     += 2;
        loc.left    += 5;
        loc.right   += 15;
        loc.bottom  += 5;
      }

      // Use the document's current zoom level to scale the region
      // into normalized coordinates
      var zoom    = currentDocument.api.relativeZoom();
      var image   = _.map([loc.top, loc.right, loc.bottom, loc.left], function(l){ return Math.round(l / zoom); }).join(',');
      if (this._kind == 'redact') {
        // ignoring redactions too small to cover anything,
        // record redaction dimensions and which page to apply them to
        if (loc.width > 5 && loc.height > 5) {
          this.redactions.push({
            location: image,
            page: this._activePageNumber
          });
        } else {
          $(this.region).remove();
        }
        this.region = null;
      } else {
        // Instruct the viewer to create a note, if the region is large enough.
        if (loc.width > 5 && loc.height > 5) {
          var highlight_type = this._highlight_type;

          // Close the editor
          this.close();

          if( highlight_type == 'graph' ) {
            currentDocument.api.addAnnotation({
              anno_type       : 'graph',
              document_id     : _annotation.get('document_id'),
              groups          : _annotation.groups,
              location        : {image : image},
              page            : this._activePageNumber,
              unsaved         : true,
              access          : 'public',
              owns_note       : true
            });
          }
          else {
            currentDocument.api.addAnnotation({
              id              : _annotation.id,
              title           : _annotation.get('title'),
              content         : _annotation.get('content'),
              document_id     : _annotation.get('document_id'),
              groups          : _annotation.groups,
              location        : {image : image},
              page            : this._activePageNumber,
              unsaved         : true,
              access          : 'public',
              owns_note       : true
            });
          }
          this.clearAnnotation();
        }
      }
      return false;
    }, this);

    this.pages.bind('mouseup', dragEnd);
  },

  // Cause matching annotation in viewer to be selected
  showAnnotation: function(anno, showEdit) {
      currentDocument.api.selectAnnotation({
          id        : anno.id,
          group_id  : anno.get('groups')[0].group_id,
          location  : anno.get('location')
      },
      showEdit);
  },

  saveAnnotation : function(anno) {
    var unsaved = anno.unsaved;
    var params = this.annotationToParams(anno);

    if(anno.anno_type == 'graph'){
      this.saveGraph(params);
    }else {
      this[unsaved ? 'createAnnotation' : 'updateAnnotation'](params);
    }
  },

  // Convert an annotation object into serializable params understood by us.
  annotationToParams : function(anno, extra) {
    delete anno.unsaved;
    var params = {
      id          : anno.server_id,
      page_number : anno.page,
      content     : anno.text,
      title       : anno.title,
      access      : anno.access,
      groups    : anno.groupCount > 0 ? [anno.groups[anno.groupIndex - 1]] : undefined,
      location    : anno.location,
      account_id  : anno.account_id,
      iteration   : anno.iteration,
      ag_iteration   : currentDocumentModel.iteration,
      match_id: anno.match_id,
      graph_json: anno.graph_json
    };
    return _.extend(params, extra || {});
  },

  selectGraph: function(params) {
    this.trigger('saveGraph', params);
  },

  createAnnotation : function(params) {
    $.ajax({url : this._baseURL, type : 'POST', data : params, dataType : 'json', success : _.bind(function(resp) {
      params.server_id = resp.id;
      this._adjustNoteCount(1, this._kind == 'public' ? 1 : 0);
    }, this)});
  },

  saveGraph : function(params) {
    _api = this;
    currentDocument.api.cleanUp(function(){ _api.trigger('saveGraph', params); });
  },

  updateAnnotation : function(params) {
    this.trigger('updateAnnotation', params);
  },

  deleteAnnotation : function(anno, groupId) {
    if( anno.get('location') ) {
        currentDocument.api.deleteAnnotation({
            id: anno.id,
            location: anno.get('location')
        }, groupId);
    }
  },

  // Fire event indicating which annotation was selected so DC-side can sync
  selectAnnotationPoint: function(anno) {
    var params = this.annotationToParams(anno);
    this.trigger('annotationSelected', params);
  },

  //Hide any existing active annotations
  hideActiveAnnotations: function(success) {
      currentDocument.api.cleanUp(success);
  },

  //Pass annotation data to DV so it can update any missing IDs
  syncDV: function(annos) {
      locationIds = annos.map(function(model) {
          return _.pick(model.toJSON(), ["id","location"]);
      });
      currentDocument.api.syncAnnotationIDs(locationIds);
  },

  //Pass group association to DV so it can update if necessary
  syncGroupAssociation: function(annoId, groupId){
      currentDocument.api.syncGroupAnnotation(annoId, groupId);
  },

  //Reload DV annotation list after a major change
  reloadAnnotations: function(annos) {
      currentDocument.api.reloadAnnotations(annos);
  },

  //Passes notification that cancel has fired in DV
  passCancelNotification: function() {
    this.trigger('annotationCancelled');
  },

  //Temporarily update view to mark annotation's state of approval
  markApproval: function(anno_id, group_id, approved) {
    currentDocument.api.markApproval(anno_id, group_id, approved);
  },

  //Populate DV's autocomplete recommendations
  setRecommendations: function(recArray) {
    currentDocument.api.setRecommendations(recArray);
  },

  // Lazily create the page-specific div for persistent elements.
  _specificPage : function() {
    // if a div for redaction already exists, return it.
    var already = $('.DV-pageSpecific-' + this._activePageNumber);
    if (already.length) return already;
    // otherwise make a div for redactions to be written into
    var el = this.make('div', {'class' : 'DV-pageSpecific DV-pageSpecific-' + this._activePageNumber});
    this._activePage.append(el);
    return $(el);
  },

  _adjustNoteCount : function(notesCount, publicCount) {
    try {
      var id = parseInt(currentDocument.api.getId(), 10);
      var doc = window.opener.Documents.get(id);
      if (doc) {
        doc.set({annotation_count : (doc.get('annotation_count') || 0) + notesCount});
        doc.set({public_note_count : (doc.get('public_note_count') || 0) + publicCount});
      }
    } catch (e) {
      // It's ok -- we don't have access to the parent window.
    }
  },

  _accessClass : function(kind) {
    return 'DV-access' + dc.inflector.capitalize(kind);
  }

});

dc.ui.ViewerBaseControlPanel = Backbone.View.extend({
    id :                  'control_panel',
    template_listing:     null,
    pointViewList:        null,
    groupViewList:        null,

    //****Commonly overridden properties
    //AnnoClass: class of annotation to create
    AnnoClass:            FuncUtils.stringToFunction("dc.ui.BaseAnnotationListing"),
    //GroupClass: class of annotation to create
    GroupClass:           FuncUtils.stringToFunction("dc.ui.BaseGroupListing"),
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

        _.bindAll(this, 'reloadCurrent');

        //If standard opening process, refresh opener to update list
        if(window.opener){ window.opener.location.reload(); }

        //Mark as changed when any update request is fired
        this.listenTo(dc.app.editor.annotationEditor, 'updateAnnotation', this.delegateUpdate);

        //Listen for graph updates
        this.listenTo(dc.app.editor.annotationEditor, 'saveGraph', this.saveGraph);

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
        var _view = new this.GroupClass(options);
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


    //Trigger graph drawing to start graph creation
    createGraph: function() {
      var _thisView = this;

      //Don't allow if this is the base group
      if( this.model.get('base') ){
          dc.ui.Dialog.alert(_.t('base_graph_error'));
      }else{
          _thisView.clearAnnotations();

          //Trigger annotation for graph
          dc.app.editor.annotationEditor.open(
              this.model,
              this.group_id,
              false,
              function() {},
              'graph'
          );
      }

    },


    //Save graph data
    saveGraph: function(anno_data) {
      this.model.save_graph(anno_data, this.reloadCurrent);
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

dc.ui.EditPageTextEditor = dc.ui.EditorToolbar.extend({

  id : 'edit_page_text_container',

  events : {
    'click .edit_page_text_confirm_input' : 'confirmEditPageText',
    'click .document_page_tile_remove'    : 'resetPage',
    'click .close_editor'                 : 'close'
  },

  initialize : function(opts) {
    this.editor = opts.editor;
    _.bindAll(this, 'cachePageText');
  },

  _resetState : function() {
    this.originalPageText = {};
    this.pageText = {};
  },

  findSelectors : function() {
    this.$s = {
      guide : $('#edit_page_text_guide'),
      guideButton: $('.edit_page_text.button'),
      page : $('.DV-text'),
      pages : $('.DV-pages'),
      viewerContainer : $('.DV-docViewer-Container'),
      header : $('#edit_page_text_container'),
      container : null,
      saveButton : $('.edit_page_text_confirm_input', this.el),
      headerTiles : $('.document_page_tiles', this.el)
    };
  },

  open : function() {
    $(this.el).show();
    this.findSelectors();
    this._resetState();
    this.setMode('is', 'open');
    this.viewer.api.enterEditPageTextMode();
    this.render();
  },

  render : function() {
    $(this.el).html(JST['edit_page_text']({}));
    this.$s.viewerContainer.append(this.el);
    if (this.viewer.state != 'ViewText') {
        this.viewer.open('ViewText');
    }
    this.$s.pages.addClass('edit_page_text_viewer');
    this.$s.container = $(this.el);
    this.findSelectors();
    this.$s.guideButton.addClass('open');
    this.$s.guide.fadeIn('fast');
    this.$s.saveButton.setMode('not', 'enabled');
    this.$s.header.removeClass('active');
    this.handleEvents();
  },

  handleEvents : function() {
    $('.DV-textContents').parent().delegate('.DV-textContents', 'keyup', this.cachePageText).delegate('.DV-textContents', 'change', this.cachePageText);
  },

  getPageNumber : function() {
    return this.viewer.api.currentPage();
  },

  getPageText : function(pageNumber) {
    pageNumber = pageNumber || this.getPageNumber();

    return this.viewer.api.getPageText(pageNumber);
  },

  confirmEditPageText : function() {
    var modifiedPages = this.getChangedPageTextPages();
    var documentId = this.viewer.api.getModelId();
    var dialog = dc.ui.Dialog.progress("Saving text edits&hellip;");

    $.ajax({
      url       : '/documents/' + documentId + '/save_page_text',
      type      : 'POST',
      data      : { modified_pages : JSON.stringify(modifiedPages) },
      dataType  : 'json',
      success   : _.bind(function(resp) {
        try {
          window.opener && window.opener.Documents && window.opener.Documents.get(documentId).set(resp);
        } catch (e) {
          // It's cool.
        }
        window.close();
        dialog.close();
        this.viewer.api.resetPageText(true);
        _.defer(dc.ui.Dialog.alert, "The page text is being saved. Please close this document.");
      }, this)
    });
  },

  setSaveState : function() {
    this.editor.setSaveState(!!_.keys(this.pageText).length);
  },

  cachePageText : function() {
    var pageNumber = this.getPageNumber();
    var pageText = dc.inflector.trim($('.DV-textContents').textWithNewlines());

    if (!(pageNumber in this.originalPageText)) {
      this.originalPageText[pageNumber] = $.trim(this.getPageText(pageNumber));
    }

    if (pageText != this.originalPageText[pageNumber]) {
      if (!(pageNumber in this.pageText)) {
        this.redrawHeader();
      }
      this.pageText[pageNumber] = pageText;
    } else {
      delete this.originalPageText[pageNumber];
      delete this.pageText[pageNumber];
      this.redrawHeader();
    }

    this.setSaveState();
    this.viewer.api.setPageText(pageText, pageNumber);
  },

  resetPage : function(e) {
    var pageNumber = $(e.currentTarget).parents('.document_page_tile').attr('data-pageNumber');

    this.viewer.api.setPageText(this.originalPageText[pageNumber], pageNumber);
    this.viewer.api.enterEditPageTextMode();
    delete this.originalPageText[pageNumber];
    delete this.pageText[pageNumber];
    this.setSaveState();
    this.redrawHeader();
  },

  redrawHeader : function() {
    var saveText;
    var editedPages = _.keys(this.originalPageText);
    var pageCount = editedPages.length;
    editedPages = editedPages.sort(function(a, b) { return a - b; });
    $('.document_page_tile', this.$s.headerTiles).empty().remove();

    if (pageCount == 0) {
      this.$s.header.removeClass('active');
      this.$s.saveButton.setMode('not', 'enabled');
    } else {
      this.$s.header.addClass('active');
      this.$s.saveButton.setMode('is', 'enabled');
    }

    // Create each page tile and add it to the page holder
    _.each(editedPages, _.bind(function(pageNumber) {
      var url = this.imageUrl;
      url = url.replace(/\{size\}/, 'thumbnail');
      url = url.replace(/\{page\}/, pageNumber);
      var $thumbnail = $(JST['document_page_tile']({
        url : url,
        pageNumber : pageNumber
      }));
      $thumbnail.attr('data-pageNumber', pageNumber);
      this.$s.headerTiles.append($thumbnail);
    }, this));

    // Update remove button's text
    if (pageCount == 0) {
      saveText = 'Save page text';
    } else {
      saveText = 'Save ' + pageCount + dc.inflector.pluralize(' page', pageCount);
    }
    $('.edit_page_text_confirm_input', this.el).val(saveText);

    // Set width of container for side-scrolling
    var width = $('.document_page_tile').length * $('.document_page_tile').eq(0).outerWidth(true);
    var confirmWidth = $('.editor_toolbar_controls', this.el).outerWidth(true);
    this.$s.headerTiles.width(width + confirmWidth + 10);
    Backbone.View.prototype.delegateEvents.call(this);
  },

  getChangedPageTextPages : function() {
    var modifiedPages = {};
    _.each(this.pageText, _.bind(function(pageText, pageNumber) {
      if (this.originalPageText[pageNumber] != pageText) {
        modifiedPages[pageNumber] = pageText;
      }
    }, this));

    return modifiedPages;
  },

  close : function() {
    if (this.modes.open == 'is') {
      this._resetState();
      this.setSaveState();
      this.setMode('not', 'open');
      this.$s.guideButton.removeClass('open');
      this.$s.guide.hide();
      this.$s.pages.removeClass('edit_page_text_viewer');
      $('.DV-textContents').attr('contentEditable', false).removeClass('DV-editing');
      $(this.el).hide();
      this.viewer.api.leaveEditPageTextMode();
    }
  }

});
dc.ui.FileNoteListing = Backbone.View.extend({

  waitingForClone:  false,
  showEdit:         false,
  showApprove:      false,
  showReject:       false,
  showNote:         false,
  tagName:          'tr',

  events : {
    'click .note_text'    : 'requestPointReload',
    'click .approve_item' : 'approveNote',
    'click .reject_item'  : 'disapproveNote'
  },

  initialize : function(options) {
    _.bindAll(this, 'render');

    this._mainJST = JST['file_note'];
  },


  render : function(showApproval) {
    _thisView = this;
    var noteText = this.model.get('group_id') ? '[GROUP] ' : '[POINT] '
    $(this.el).html(this._mainJST({
      title:          noteText + this.model.get('note'),
      show_approval:  showApproval
    }));

    if(this.model.get('addressed')){ this.showReject(); }else{ this.showApprove(); }
    return this;
  },


  showApprove : function() {
      this.$('.reject_item').hide();
      this.$('.row_status').removeClass('complete');
      this.$('.row_status').addClass('incomplete');
      this.$('.approve_item').show().css('display', 'inline-block');
  },


  showReject : function() {
      this.$('.approve_item').hide();
      this.$('.row_status').removeClass('incomplete');
      this.$('.row_status').addClass('complete');
      this.$('.reject_item').show().css('display', 'inline-block');
  },


  //Send request to redirect to the AnnotationGroup this note refers to
  requestPointReload : function() {
    var payload = {
      group_id: this.model.get('group_id') ? this.model.get('group_id') : this.model.get('annotation_group').group_id,
      annotation_id: this.model.get('annotation_group') ? this.model.get('annotation_group').annotation_id : null
    }
    this.trigger('requestPointReload', payload);
  },


  approveNote : function() {
    this.showReject();
    this.model.address(true);
  },

  disapproveNote: function() {
    this.showApprove();
    this.model.address(false);
  }

});

dc.ui.FileNoteDialog = dc.ui.Dialog.extend({

  id                : 'file_note_dialog',
  className         : 'dialog tempalog',
  template          : null,
  parentTemplate    : null,
  noteViewList      : [],


  dataEvents : {
      'click .cancel'     : 'close',
      'click .ok'         : 'save'
  },


  constructor : function(document, noteList, onClose, showApproval) {
    this.document           = document;
    this.noteList           = noteList;
    this.options.onClose    = onClose;
    this.showApproval       = showApproval != null ? showApproval : true;
    this.events         = _.extend({}, this.events, this.dataEvents);
    this._mainJST = JST['file_note_dialog'];
    _.bindAll(this, 'render');
    dc.ui.Dialog.call(this, {
        mode : 'custom',
        title : _.t('paragraph_description_of_document'),
        saveText : _.t('save'),
        noOverlay: true,
        noOK: document.get('status') != 7 //Don't show OK if status is not In QA
    });

    _thisView = this;

    this.render();

    $(document.body).append(this.el);
  },


  render : function() {
    var _thisView = this;

    //Base dialog object needs
    dc.ui.Dialog.prototype.render.call(this);
    this._container = this.$('.custom');

    //Main template
    var qa_note = this.document.get('qa_note') ? this.document.get('qa_note').replace(/(?:\r\n|\r|\n)/g, '<br />') : null;
    this._container.html(this._mainJST({qa_note: qa_note}));

    //Notes
    this.noteViewList = [];
    this.noteList.each(function(model, index) {
        _view = new dc.ui.FileNoteListing({model: model});
        _thisView.noteViewList.push(_view);
        _view.render(_thisView.showApproval);
        _thisView.listenTo(_view, 'requestPointReload', _thisView.requestPointReload);
    });
    $('#note_section table').html(_.pluck(this.noteViewList,'el'));

    return this;
  },


  save : function(success) {
    _thisView = this;

    this.document.set({qa_note: $('#qa_note').val()});
    this.document.save({},{success: function() {
        _thisView.close();
    }});
  },


  requestPointReload : function(payload){
    this.trigger('requestPointReload', payload);
  }

}, {

  // This static method is used for conveniently opening the dialog for
  // any selected template.
  open : function(document, noteList) {
    new dc.ui.FileNoteDialog(document, noteList);
  }

});

dc.ui.RemovePagesEditor = dc.ui.EditorToolbar.extend({

  id : 'remove_pages_container',

  events : {
    'click .document_page_tile_remove'  : 'removePageFromRemoveSet',
    'click .remove_pages_confirm_input' : 'confirmRemovePages',
    'click .close_editor'               : 'close'
  },

  initialize : function(options) {
    this.editor = options.editor;
  },

  findSelectors : function() {
    this.$s = {
      guide : $('#edit_remove_pages_guide'),
      guideButton: $('.edit_remove_pages'),
      thumbnails : $('.DV-thumbnail'),
      thumbnailsContainer : $('.DV-thumbnails'),
      pages : $('.DV-pages'),
      viewerContainer : $('.DV-docViewer-Container'),
      saveButton : this.$('.remove_pages_confirm_input'),
      holder : null,
      container : null
    };
  },

  open : function() {
    $(this.el).show();
    this.findSelectors();
    this.removePages = [];
    this.setMode('is', 'open');
    this.$s.guide.fadeIn('fast');
    this.$s.guideButton.addClass('open');
    this.viewer.api.enterRemovePagesMode();
    this.hideSelectedThumbnail();
    this.render();
  },

  render : function() {
    $(this.el).show().html(JST['remove_pages']({}));
    this.$s.viewerContainer.append(this.el);
    if (this.viewer.state != 'ViewDocument' && this.viewer.state != 'ViewThumbnails') {
        this.viewer.open('ViewThumbnails');
    }
    this.$s.pages.addClass('remove_pages_viewer');
    this.$s.thumbnails.removeClass('DV-selected');
    this.$s.holder = $('.remove_pages_page_container', this.el);
    this.$s.container = $(this.el);
    this.$s.saveButton.setMode('not', 'enabled');
    this.redrawPages();
    this.handleEvents();
  },

  unbindEvents : function() {
    this.$s.thumbnailsContainer.unbind('mousedown.dv-remove');
  },

  handleEvents : function() {
    this.unbindEvents();

    this.$s.thumbnailsContainer.bind('mousedown.dv-remove', _.bind(function(e) {
      var $target = $(e.target);
      if ($target.closest('.DV-thumbnail-page').length == 0) return;

      var $thumbnail = $target.closest('.DV-thumbnail');
      var imageSrc = $('.DV-pageImage,.DV-thumbnail-image img', $thumbnail).eq(0).attr('src');
      var pageNumber = $thumbnail.attr('data-pageNumber');
      if (_.contains(this.removePages, pageNumber)) {
        this.removePageNumberFromRemoveSet(pageNumber);
      } else {
        this.addPageToRemoveSet(pageNumber);
      }
    }, this));
  },

  addPageToRemoveSet : function(pageNumber) {
    if (!(_.contains(this.removePages, pageNumber))) {
      this.viewer.api.addPageToRemovedPages(pageNumber);
      this.removePages.push(pageNumber);
      this.redrawPages();
      this.$s.thumbnails.eq(pageNumber-1).addClass('DV-selected');
    }
  },

  removePageFromRemoveSet : function(e) {
    var pageNumber = $(e.target).parents('.document_page_tile').attr('data-pageNumber');
    this.removePageNumberFromRemoveSet(pageNumber);
  },

  removePageNumberFromRemoveSet : function(pageNumber) {
    this.removePages = _.reject(this.removePages, function(p) { return p == pageNumber; });
    this.redrawPages();
    this.viewer.api.removePageFromRemovedPages(pageNumber);
    this.$s.thumbnails.eq(pageNumber-1).removeClass('DV-selected');
  },

  redrawPages : function() {
    var pageCount = this.removePages.length;
    this.editor.setSaveState(!!pageCount);
    this.removePages = this.removePages.sort(function(a, b) { return a - b; });
    $('.document_page_tile', this.$s.holder).empty().remove();

    if (pageCount == 0) {
      this.$s.container.addClass('empty');
      this.$('.remove_pages_confirm_input').setMode('not', 'enabled');
    } else {
      this.$s.container.removeClass('empty');
      this.$('.remove_pages_confirm_input').setMode('is', 'enabled');
    }

    // Create each page tile and add it to the page holder
    _.each(this.removePages, _.bind(function(pageNumber) {
      var url = this.imageUrl;
      url = url.replace(/\{size\}/, 'thumbnail');
      url = url.replace(/\{page\}/, pageNumber);
      var $thumbnail = $(JST['document_page_tile']({
        url : url,
        pageNumber : pageNumber
      }));
      $thumbnail.attr('data-pageNumber', pageNumber);
      this.$s.holder.append($thumbnail);
    }, this));

    // Update remove button's text
    this.$('.remove_pages_confirm_input').text( _.t("remove_pages_input", pageCount ) );

    // Set width of container for side-scrolling
    var width = $('.document_page_tile').length * $('.document_page_tile').eq(0).outerWidth(true);
    var confirmWidth = $('.editor_toolbar_controls', this.el).outerWidth(true);
    this.$s.holder.width(width + confirmWidth + 10);
  },

  confirmRemovePages : function() {
    var pageCount = this.removePages.length;
    if (!pageCount) return;
    if (pageCount >= this.viewer.api.numberOfPages()) {
      dc.ui.Dialog.alert( _.t('cannot_remove_all'));
      return;
    }

    dc.ui.Dialog.confirm( _.t('remove_page_warning_message', pageCount ), _.bind(function() {
      this.$s.saveButton.text( _.t('removing') ).attr('disabled', true).setMode('not', 'enabled');
      this.save();
      return true;
    }, this));
  },

  save : function() {
    dc.ui.Dialog.progress("Removing Pages&hellip;");
    var modelId = this.viewer.api.getModelId();

    $.ajax({
      url       : '/documents/' + modelId + '/remove_pages',
      type      : 'POST',
      data      : { pages : this.removePages },
      dataType  : 'json',
      success   : function(resp) {
        try {
          window.opener && window.opener.Documents && window.opener.Documents.get(modelId).set(resp);
        } catch (e) {
          // It's cool.
        }
        window.close();
        _.defer(dc.ui.Dialog.alert, _.t('pages_are_being_removed') );
      }
    });
  },

  close : function() {
    if (this.modes.open == 'is') {
      this.editor.setSaveState();
      this.setMode('not', 'open');
      this.$s.guide.hide();
      this.$s.guideButton.removeClass('open');
      this.$s.pages.removeClass('remove_pages_viewer');
      this.$s.thumbnails.removeClass('DV-selected');
      this.unbindEvents();
      $(this.el).empty().hide();
      this.viewer.api.leaveRemovePagesMode();
    }
  }

});

dc.ui.ReorderPagesEditor = dc.ui.EditorToolbar.extend({

  id : 'reorder_pages_container',

  events : {
    'click .reorder_pages_confirm_input' : 'confirmReorderPages',
    'click .close_editor'                : 'close'
  },

  initialize : function(options) {
    this.editor = options.editor;
  },

  findSelectors : function() {
    this.$s = {
      guide : $('#edit_reorder_pages_guide'),
      guideButton: $('.edit_reorder_pages'),
      page : $('.DV-page,.DV-thumbnail'),
      thumbnails : $('.DV-thumbnails'),
      pages : $('.DV-pages'),
      viewerContainer : $('.DV-docViewer-Container'),
      header : $('#reorder_pages_container'),
      container : null,
      saveButton : $('.reorder_pages_confirm_input')
    };
  },

  open : function() {
    $(this.el).show();
    this.findSelectors();
    this.setMode('is', 'open');
    this.viewer.api.enterReorderPagesMode();
    this.viewer.api.resetReorderedPages();
    this.render();
    this.orderChanged = false;
    this.$s.guide.fadeIn('fast');
    this.$s.guideButton.addClass('open');
    this.$s.saveButton.setMode('not', 'enabled');
    this.hideSelectedThumbnail();
  },

  render : function() {
    $(this.el).html(JST['reorder_pages']({}));
    this.$s.viewerContainer.append(this.el);
    this.findSelectors();
    if (this.viewer.state != 'ViewThumbnails') {
        this.viewer.open('ViewThumbnails');
    }
    this.$s.pages.addClass('reorder_pages_viewer');
    this.$s.container = $(this.el);
    $('.DV-currentPageImage', this.$s.thumbnails).removeClass('DV-currentPageImage')
                                            .addClass('DV-currentPageImage-disabled');
    this.handleEvents();
    this.initialOrder = this.serializePageOrder();
  },

  handleEvents : function() {
    var $thumbnails = this.$s.thumbnails;

    $('.DV-thumbnail', $thumbnails).each(function(i) {
      $(this).attr('data-pageNumber', i+1);
    });
    $('.DV-currentPageImage', $thumbnails).removeClass('DV-currentPageImage').addClass('DV-currentPageImage-disabled');
    jQuery('.DV-thumbnails').sortable({
      containment: '.DV-thumbnails',
      items: '.DV-thumbnail',
      handle: '.DV-thumbnail-page',
      cursor: 'move',
      scrollSensitivity: 80,
      scrollSpeed: 15,
      tolerance: 'pointer',
      zIndex: 10,
      stop: _.bind(function(e, ui) {
        this.refreshHeader();
      }, this)
    });
  },

  refreshHeader : function() {
    var changed = !_.isEqual(this.serializePageOrder(), this.initialOrder);
    this.orderChanged = changed;
    this.$s.saveButton.setMode(changed ? 'is' : 'not', 'enabled');
    this.editor.setSaveState(changed);
  },

  confirmReorderPages : function() {
    if (!this.orderChanged) return;
    dc.ui.Dialog.confirm("You've reordered the pages in this document. The document will close while it's being rebuilt. Are you sure you're ready to proceed?", _.bind(function() {
      $('input.reorder_pages_confirm_input', this.el).val('Reordering...').attr('disabled', true);
      this.save();
      return true;
    }, this));
  },

  serializePageOrder : function() {
    var pageOrder = [];

    $('.DV-thumbnail', this.$s.thumbnails).each(function() {
      pageOrder.push(parseInt($(this).attr('data-pageNumber'), 10));
    });

    return pageOrder;
  },

  save : function() {
    dc.ui.Dialog.progress("Reordering Pages&hellip;");
    var pageOrder = this.serializePageOrder();
    var modelId = this.viewer.api.getModelId();

    $.ajax({
      url       : '/documents/' + modelId + '/reorder_pages',
      type      : 'POST',
      data      : { page_order : pageOrder },
      dataType  : 'json',
      success   : function(resp) {
        try {
          window.opener && window.opener.Documents && window.opener.Documents.get(modelId).set(resp);
        } catch (e) {
          // It's alright.
        }
        window.close();
        _.defer(dc.ui.Dialog.alert, "The pages are being reordered. Please close this document.");
      }
    });
  },

  close : function() {
    if (this.modes.open == 'is') {
      this.editor.setSaveState();
      $('.DV-currentPageImage-disabled', this.$s.page).addClass('DV-currentPageImage').removeClass('DV-currentPageImage-disabled');
      this.setMode('not', 'open');
      jQuery('.DV-thumbnails').sortable('destroy');
      this.$s.guide.hide();
      this.$s.guideButton.removeClass('open');
      this.$s.pages.removeClass('reorder_pages_viewer');
      $(this.el).hide();
      this.viewer.api.leaveReorderPagesMode();
    }
  }

});
dc.ui.ReplacePagesEditor = dc.ui.EditorToolbar.extend({

  id : 'replace_pages_container',

  events : {
    'click .close_editor' : 'close'
  },

  initialize : function(options) {
    this.editor = options.editor;
  },

  findSelectors : function() {
    this.$s = {
      guide: $('#edit_replace_pages_guide'),
      guideButton: $('.edit_replace_pages'),
      thumbnails : $('.DV-thumbnail'),
      thumbnailImages : $('.DV-thumbnail .DV-thumbnail-image'),
      pages : $('.DV-pages'),
      viewerContainer : $('.DV-docViewer-Container'),
      hint : this.$(".editor_hint"),
      container : null
    };
  },

  open : function() {
    $(this.el).show();
    this.findSelectors();
    this.setMode('is', 'open');
    this.$s.guide.fadeIn('fast');
    this.$s.guideButton.addClass('open');
    this.viewer.api.enterReplacePagesMode();
    this.render();
    this.hideSelectedThumbnail();
    this.resetSelected();
  },

  resetSelected : function() {
    $('.DV-currentPageImage', this.$s.pages).removeClass('DV-currentPageImage').addClass('DV-currentPageImage-disabled');
    this.$s.thumbnails.removeClass('DV-selected');
    this.$s.thumbnails.find('.left_chosen,.right_chosen').removeClass('left_chosen')
                                                         .removeClass('right_chosen');
  },

  render : function() {
    if (this.viewer.state != 'ViewThumbnails') {
        this.viewer.open('ViewThumbnails');
    }
    $(this.el).html(JST['replace_pages']({}));
    this.$s.viewerContainer.append(this.el);
    this.$s.pages.addClass('replace_pages_viewer');
    this.$s.container = $(this.el);
    this.findSelectors();
    this.updateHint('choose');
    dc.app.uploader = new dc.ui.UploadDialog({
      editable    : false,
      insertPages : true,
      autostart   : true,
      documentId  : this.viewer.api.getModelId()
    });
    dc.app.uploader.setupUpload();
    this.handleEvents();
    this.delegateEvents();
  },

  unbindEvents : function() {
    var $thumbnails = this.$s.thumbnails;
    var $thumbnailImages = this.$s.thumbnailImages;
    $thumbnails.unbind('mouseout.dv-replace')
               .unbind('mousemove.dv-replace')
               .unbind('mousedown.dv-replace')
               .unbind('mouseover.dv-replace')
               .unbind('mouseenter.dv-replace')
               .unbind('mouseleave.dv-replace');
    $thumbnailImages.unbind('mouseout.dv-replace')
                    .unbind('mouseover.dv-replace');
  },

  handleEvents : function() {
    var $thumbnails = this.$s.thumbnails;
    var $thumbnailImages = this.$s.thumbnailImages;

    this.unbindEvents();

    $thumbnails.each(function(i) {
      $(this).attr('data-pageNumber', i+1);
    });

    $thumbnails.bind('mouseover.dv-replace', function() {
      $(this).addClass('DV-hover-thumbnail');
    });
    $thumbnails.bind('mouseout.dv-replace', function() {
      $('.DV-overlay', this).removeClass('left').removeClass('right');
      $(this).removeClass('DV-hover-thumbnail');
    });
    $thumbnails.bind('mousemove.dv-replace', function(e) {
      var $this = $(this);
      if (!$this.hasClass('DV-hover-image')) {
        var pageNumber = $this.attr('data-pageNumber');
        var offset = $this.offset();
        var width = $this.outerWidth(true);
        var positionX = e.clientX - offset.left;
        var amount = positionX / width;
        var side = amount < 0.2 ? 'left' : amount > 0.8 ? 'right' : '';
        $('.DV-overlay', $this).removeClass('left').removeClass('right').addClass(side);
      }
    });

    $thumbnails.bind('mousedown.dv-replace', _.bind(function(e) {
      e.preventDefault();
      e.stopPropagation();
      this.confirmPageChoice($(e.currentTarget));
    }, this));

    $thumbnailImages.bind('mouseover.dv-replace', function(e) {
        $(this).closest('.DV-thumbnail').addClass('DV-hover-image');
    });

    $thumbnailImages.bind('mouseout.dv-replace', function(e) {
        $(this).closest('.DV-thumbnail').removeClass('DV-hover-image');
    });
  },

  confirmPageChoice : function($thumbnail) {
    var $thumbnails = this.$s.thumbnails;
    var isSingleSelection = true;

    this.resetSelected();

    if (dc.app.hotkeys.shift && this.$firstPageSelection && this.$firstPageSelection.length) {
      var firstPageNumber = parseInt(this.$firstPageSelection.attr('data-pageNumber'), 10);
      var thumbnailPageNumber = parseInt($thumbnail.attr('data-pageNumber'), 10);
      var end = Math.max(thumbnailPageNumber, firstPageNumber);
      var start = Math.min(thumbnailPageNumber, firstPageNumber);
      var isReverse = firstPageNumber > thumbnailPageNumber;
      var isLeft = $('.DV-overlay', $thumbnail).hasClass('left');
      var isRight = $('.DV-overlay', $thumbnail).hasClass('right');

      isSingleSelection = false;

      if (!$thumbnail.hasClass('DV-hover-image')) {
        if (isLeft && isReverse) {
          end -= 1;
        } else if (isLeft && !isReverse) {
          end -= 1;
        } else if (isRight && isReverse) {
          start += 1;
          end -= 1;
        }
      }
      if (!isLeft && !isRight && isReverse) {
        end -= 1;
      }
      if (isReverse && !this.isFirstPageBetween) {
        end += 1;
      }
      if (end < start) isSingleSelection = true;

      if (!isSingleSelection) {
        $thumbnails = $thumbnails.filter(function() {
          var page = $(this).attr('data-pageNumber');
          return start <= page && page <= end;
        });
        $thumbnails.addClass('DV-selected');
        this.updateHint('replace');
      }
    }
    if (isSingleSelection) {
      if ($thumbnail.hasClass('DV-hover-image')) {
        this.$firstPageSelection = $thumbnail;
        this.isFirstPageBetween = false;
        $thumbnail.addClass('DV-selected');
        this.updateHint('replace');
      } else if ($thumbnail.hasClass('DV-hover-thumbnail')) {
        var $left = $('.left', $thumbnails);
        var $right = $('.right', $thumbnails);

        if ($left.length) {
          $left.addClass('left_chosen');
          this.$firstPageSelection = $thumbnail;
        } else if ($right.length) {
          $right.addClass('right_chosen');
          this.$firstPageSelection = $thumbnail.next();
          if (!this.$firstPageSelection.length) this.$firstPageSelection = $thumbnail;
        } else {
          this.updateHint('choose');
          return false;
        }
        this.isFirstPageBetween = true;
        this.updateHint('insert');
      }
    }
  },

  updateHint : function(state) {
    var hint, range, insertion;

    if (state == 'choose') {
      hint = _.t('choose_location_to_insert_pages');
      $(this.el).setMode('off', 'upload');
      this.$('.replace_pages_upload_button').setMode('not', 'enabled');
    } else {
      var replace = state == 'replace';
      $(this.el).setMode('on', 'upload');
      this.$('.replace_pages_upload_button').setMode('is', 'enabled');
//      hint = ( replace ? _.t('replace') : _.t('insert') ) + ' ';
      if (replace) {
        range = this.getPageRange();
        if (range.start != range.end) {
          hint = _.t('replace_multiple_pages', range.start, range.end );
        } else {
          hint = _.t('replace_page_x', range.start );
        }
      } else if (state == 'insert') {
        var pageCount = this.viewer.api.numberOfPages();
        var insertion = this.getInsertPageNumber();
        if (insertion < 1) {
          hint = _.t('insert_first_page');
        } else if (insertion < pageCount) {
          hint = _.t('insert_between_pages', insertion, insertion+1 );
        } else if (insertion >= pageCount) {
          hint = _.t('insert_last_page');
        }
      }
      dc.app.uploader.insertPagesAttrs({
        insertPageAt:       insertion,
        replacePagesStart:  range && range.start,
        replacePagesEnd:    range && range.end
      });
    }

    this.$s.hint.text(hint);
  },

  getPageRange : function() {
    var $thumbnails = this.$s.thumbnails;
    var $thumbnail = $thumbnails.filter('.DV-selected');

    var range = _.map($thumbnail, function(t) {
      return parseInt($(t).attr('data-pageNumber'), 10);
    });
    var start = _.min(range);
    var end = _.max(range);

    return {
      start: start,
      end: end
    };
  },

  getInsertPageNumber : function() {
    var $active = this.$s.thumbnails.has('.left,.right');
    var pageNumber = parseInt($active.attr('data-pageNumber'), 10);

    if ($active.find('.left').length) {
      return pageNumber - 1;
    } else if ($active.find('.right').length) {
      return pageNumber;
    }
  },

  close : function() {
    if (this.modes.open == 'is') {
      $('.DV-currentPageImage-disabled', this.$s.pages).addClass('DV-currentPageImage').removeClass('DV-currentPageImage-disabled');
      $('.left_chosen').removeClass('left_chosen');
      $('.right_chosen').removeClass('right_chosen');
      $('.DV-selected').removeClass('DV-selected');
      this.setMode('not', 'open');
      this.$s.guide.hide();
      this.unbindEvents();
      this.$s.guideButton.removeClass('open');
      this.$s.pages.removeClass('replace_pages_viewer');
      $(this.el).hide();
      this.viewer.api.leaveReplacePagesMode();
    }
  }

});

dc.ui.SectionEditor = Backbone.View.extend({

  constructor : function(options) {
    Backbone.View.call(this, options);
    _.bindAll(this, 'addRow', 'saveSections', 'removeAllSections');
  },

  open : function() {
    if (this.dialog) return false;
    this.sections = _.sortBy(currentDocument.api.getSections(), function(s){ return parseInt(s.pageNumber, 10); });
    this.dialog = new dc.ui.Dialog({
      title       : _.t('edit_sections'),
      information : _.t('enter_title_and_page'),
      id          : 'section_editor',
      mode        : 'confirm',
      saveText    : _.t('save'),
      onClose     : _.bind(function(){ this.dialog = null; }, this),
      onConfirm   : _.bind(function(){ return this.saveSections(this.serializeSections()); }, this)
    }).render();
    this.sectionsEl = $(this.make('ul', {id : 'section_rows', 'class' : 'not_draggable'}));
    this.removeEl   = $(this.make('div', {'class' : 'minibutton warn remove_all'}, _.t('remove_all') ));
    this.removeEl.bind('click', this.removeAllSections);
    this.dialog.append(this.sectionsEl);
    this.dialog.addControl(this.removeEl);
    this.renderSections();
  },

  saveSections : function(sections) {
    var numbers = _.pluck(sections, 'page_number');
    if (numbers.length > _.uniq(numbers).length) return this.dialog.error( _.t('no_duplicate_section'));
    if (this.impossibleSections(sections)) return this.dialog.error( _.t('no_section_outside_doc') );
    $.ajax({
      url       : '/sections/set',
      type      : 'POST',
      data      : {sections : JSON.stringify(sections), document_id : dc.app.editor.docId},
      dataType  : 'json'
    });
    this.updateNavigation(sections);
    return true;
  },

  removeAllSections : function() {
    this.saveSections([]);
    this.dialog.close();
  },

  impossibleSections : function(sections) {
    var total = currentDocument.api.numberOfPages();
    return _.any(sections, function(sec) {
      return (sec.page_number < 1) || (sec.page_number > total);
    });
  },

  serializeSections : function() {
    var sections = [];
    $('.section_row').each(function(i, row) {
      var title = $('input', row).val();
      var first = parseInt($('.page_number', row).val(), 10);
      if (title) sections.push({title : title, page_number : first, page : first});
    });
    return sections;
  },

  renderSections : function() {
    var me = this;
    if (!_.size(this.sections)) return _.each(_.range(3), function(){ me.addRow(); });
    _.each(this.sections, function(sec) {
      me.addRow({title : sec.title, page_number : sec.page});
    });
  },

  updateNavigation : function(sections) {
    sections = _.map(sections, function(s){ return _.extend({page : s.page_number}, s); });
    currentDocument.api.setSections(sections);
  },

  addRow : function(options) {
    options = _.extend({pageCount : currentDocument.api.numberOfPages(), title : '', page_number : ''}, options);
    var row = $(JST['section_row'](options));
    $('.section_title', row).val(options.title).placeholder();
    $('.minus', row).bind('click', function(){ row.remove(); });
    $('.plus', row).bind('click', _.bind(function(){ this.addRow({after : row}); }, this));
    if (options.after) return options.after.after(row);
    this.sectionsEl.append(row);
  }

});

dc.ui.DEAnnotationListing = dc.ui.BaseAnnotationListing.extend({
  showEdit: true, //Show edit UI in DV

  render : function() {
    dc.ui.BaseAnnotationListing.prototype.render.apply(this, arguments);

    if( this.model.get('location') || this.model.get('is_graph_data') ){
        this.$('.clone_item').hide();
        this.$('.row_status').removeClass('incomplete');
        this.$('.row_status').addClass('complete');
    }

    return this;
  }
});

dc.ui.DEGroupListing = dc.ui.BaseGroupListing.extend({

  initialize : function() {
    dc.ui.BaseGroupListing.prototype.initialize.apply(this, arguments);

    if( this.model.get('is_graph_data') ){
        this.showEdit = false;
        this.showDelete = false;
        this.showClone = false;
    }

    return this;
  }
});

dc.ui.ViewerDEControlPanel = dc.ui.ViewerBaseControlPanel.extend({

  AnnoClass: FuncUtils.stringToFunction("dc.ui.DEAnnotationListing"),
  GroupClass: FuncUtils.stringToFunction("dc.ui.DEGroupListing"),


  initialize: function(options) {
      //Listen for annotation selects and adjust UI accordingly
      this.listenTo(dc.app.editor.annotationEditor, 'annotationSelected', this.handleAnnotationSelect);
      this.listenTo(dc.app.editor.annotationEditor, 'annotationCancelled', this.handleAnnotationCancel);

      _.bindAll(this, 'handleMarkCompleteError')

      dc.ui.ViewerBaseControlPanel.prototype.initialize.apply(this, arguments);
  },


  render : function(annoId) {
    var _deView           = this;
    var _mainJST = JST['de_control_panel'];
    var templateName    = this.model.get('group_template') == null ? null : this.model.get('group_template').name;
    $(this.el).html(_mainJST({
      template_name: templateName ? templateName.substring(0,39) : null,
      help_url: this.model.get('help_url')
    }));

    //Group Navigation
    $('.group_navigation').html(this.generateGroupNav());

    //Group Listings
    this.model.children.each(function(model, index){
        _deView.addGroup({
            model: model,
            showStatus: false
        });
    });
    $('#group_section').html(_.pluck(this.groupViewList, 'el'));

    //Annotations
    this.model.annotations.each(function(model, index) {
       var _view = _deView.addDataPoint(model, (model.id == annoId));
    });
    $('#annotation_section').html(_.pluck(this.pointViewList,'el'));

    return this;
  },


  //Save: save all valid data point changes if no errors
  save: function(success) {
    var _deView = this;

    //Clear error class from all inputs
    $('input').removeClass('error');
    var _hasErrors = false;

    //Check for duplicate annotation titles.  If found, throw error and exit
    var titleList = [];
    for(var i=0; i < this.pointViewList.length; i++){
        if( $.inArray(this.pointViewList[i].model.get('title'), titleList) > -1 ){
            dc.ui.Dialog.alert(_.t('duplicate_titles', this.pointViewList[i].model.get('title')));
            return false;
        }else{
            titleList.push(this.pointViewList[i].model.get('title'));
        }
    }

    //Remove any blank points
    this.model.annotations.remove(this.model.annotations.where({title: (null || undefined), content: (null || undefined)}));

    //If there are non-blank annotations, attempt to sync them with DB.
    if( this.model.annotations.length > 0 ) {
      //Hide annotations/check for unfinished annotations in DV; if successful, save
      dc.app.editor.annotationEditor.hideActiveAnnotations(function(){
        _deView.model.annotations.pushAll({success: function(){
          _deView.syncDV(success)
        }});
      });
    }
    else {
        //If not, just double check for unfinished annotations in DV, then pass along to success function
      dc.app.editor.annotationEditor.hideActiveAnnotations(function(){ success.call(); });
    }
  },


  //Override for adding a data point.. adds additional listener
  addDataPoint: function(model, highlight){
    var _view = dc.ui.ViewerBaseControlPanel.prototype.addDataPoint.apply(this, [model, highlight]);
    this.listenTo(_view, 'pointDeleted', this.handlePointDelete);
    return _view;
  },


  //When annotation selected in DV, find a data point that's waiting for DV input or matches the annotation and pass response to it.  If neither,
  //reload to a group that contains a point that matches it
  handleAnnotationSelect: function(anno){
      var _deView = this;
      //If previously saved point (has ID assigned)..
      if( anno.id ){
          //If a data point is waiting for a clone response, pass response, then create copy
          var _view = _.find(this.pointViewList, function(view){ return view.waitingForClone; });
          if( _view ) {
              //First check that another anno with the same title doesn't exist; if so, prompt
              var _dupeView = _.find(this.pointViewList, function(view){ return (anno.title == view.model.get('title')) && !view.waitingForClone });
              if( _dupeView ){
                  dc.ui.Dialog.confirm(_.t('duplicate_point_error'), function(){
                      if( _dupeView.model.id != anno.id ) {
                        //If not replacing an anno with the exact same anno, delete old and replace with new
                        _dupeView.deletePoint();
                        _deView.replacePoint(anno, _view);
                        dc.app.editor.annotationEditor.syncGroupAssociation(anno.id, _deView.model.id);
                      }else{
                        //If the copy request is just the same anno again, just delete the empty anno
                        _view.deletePoint();
                      }
                      return true;
                  },{
                      onCancel: function(){ dc.app.editor.annotationEditor.hideActiveAnnotations(); }
                  });
              }else {
                  _deView.replacePoint(anno, _view);
                  dc.app.editor.annotationEditor.syncGroupAssociation(anno.id, this.model.id);
              }
          }else{
              //If the group selected is this group, find and highlight point; otherwise save and reload proper group
              if( anno.groups[0].group_id == _deView.model.id ) {
                  _view = _.find(this.pointViewList, function(view){ return view.model.id == anno.id; });
                  if( _view ){ _view.highlight(); }
              }else {
                  this.save(function () {
                      _deView.reloadPoints(anno.groups[0].group_id, anno.id);
                  });
              }
          }
      }else{
          _view = _.find(this.pointViewList, function(view){ return view.model.get('location') == anno.location; });
          _view.highlight(anno);
      }
  },


  handleAnnotationCancel: function() {
    this.clearAnnotations();
  },


  handleGroupCloneRequest: function(group) {
    var _thisView = this;
    var _cloningDialog = dc.ui.Dialog.progress('Cloning..');
    group.clone(this.model.id, function(){
      _cloningDialog.close();
      _thisView.reloadPoints(_thisView.model.id);
    });
  },


  handleGroupDelete: function(group){
      this.reloadAnnotations();
  },


  handlePointDelete: function(annoView){
    //Manually remove model from collection if it's still there.. as extra protection due to the fact that the anno id/anno group id dichotomy confuses model.destroy
    for(i=0; i < this.model.annotations.length; i++){
      if( this.model.annotations.at(i) == annoView.model ){
        this.model.annotations.remove(this.model.annotations.at(i));
        break;
      }
    }

    //Remove view from tracking
    this.pointViewList = this.pointViewList.filter(function (val) { return val != annoView; });
  },


  //markComplete: If confirmed, save current data and send request to mark complete; handle error if not able to mark complete
  markComplete: function() {
      _thisView = this;
      dc.ui.Dialog.confirm(_.t('confirm_mark_complete'), function(){
          _thisView.save(function() {
              _thisView.docModel.markComplete({
                  success: function() {
                    if(window.opener){ window.opener.location.reload(); }
                    window.close();
                  },
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

dc.ui.ExtractAnnotationListing = dc.ui.BaseAnnotationListing.extend({
  showEdit: true, //Show edit UI in DV

  render : function() {
    dc.ui.BaseAnnotationListing.prototype.render.apply(this, arguments);

    this.$('.delete_item').hide();
    this.$('.clone_item').hide();
    this.$('.row_status').hide();

    return this;
  }
});

dc.ui.ViewerExtractControlPanel = dc.ui.ViewerBaseControlPanel.extend({

  AnnoClass: FuncUtils.stringToFunction("dc.ui.ExtractAnnotationListing"),


  initialize: function(options) {
      //Listen for annotation selects and adjust UI accordingly
      this.listenTo(dc.app.editor.annotationEditor, 'annotationSelected', this.handleAnnotationSelect);
      this.listenTo(dc.app.editor.annotationEditor, 'annotationCancelled', this.handleAnnotationCancel);

      _.bindAll(this, 'handleMarkCompleteError')

      dc.ui.ViewerBaseControlPanel.prototype.initialize.apply(this, arguments);
  },


  render : function(annoId) {
    var _deView           = this;
    var _mainJST = JST['extract_control_panel'];
    var templateName    = this.model.get('group_template') == null ? null : this.model.get('group_template').name;
    $(this.el).html(_mainJST({
      template_name: templateName ? templateName.substring(0,39) : null,
      help_url: this.model.get('help_url')
    }));

    //Group Navigation
    $('.group_navigation').html(this.generateGroupNav());

    //Group Listings
    this.model.children.each(function(model, index){
        _deView.addGroup({
            model: model,
            showStatus: false,
            showClone: false,
            showDelete: false
        });
    });
    $('#group_section').html(_.pluck(this.groupViewList, 'el'));

    //Annotations
    this.model.annotations.each(function(model, index) {
       var _view = _deView.addDataPoint(model, (model.id == annoId));
    });
    $('#annotation_section').html(_.pluck(this.pointViewList,'el'));

    return this;
  },


  //Save: save all valid data point changes if no errors
  save: function(success) {
    var _deView = this;

    //Clear error class from all inputs
    $('input').removeClass('error');
    var _hasErrors = false;

    //Check for duplicate annotation titles.  If found, throw error and exit
    var titleList = [];
    for(var i=0; i < this.pointViewList.length; i++){
        if( $.inArray(this.pointViewList[i].model.get('title'), titleList) > -1 ){
            dc.ui.Dialog.alert(_.t('duplicate_titles', this.pointViewList[i].model.get('title')));
            return false;
        }else{
            titleList.push(this.pointViewList[i].model.get('title'));
        }
    }

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


  //When annotation selected in DV, find a data point that's waiting for DV input or matches the annotation and pass response to it.  If neither,
  //reload to a group that contains a point that matches it
  handleAnnotationSelect: function(anno){
      var _deView = this;
      //If previously saved point (has ID assigned)..
      if( anno.id ){
          //If a data point is waiting for a clone response, pass response, then create copy
          var _view = _.find(this.pointViewList, function(view){ return view.waitingForClone; });
          if( _view ) {
              //First check that another anno with the same title doesn't exist; if so, prompt
              var _dupeView = _.find(this.pointViewList, function(view){ return (anno.title == view.model.get('title')) && !view.waitingForClone });
              if( _dupeView ){
                  dc.ui.Dialog.confirm(_.t('duplicate_point_error'), function(){
                      _dupeView.deletePoint();
                      _deView.replacePoint(anno, _view);
                      dc.app.editor.annotationEditor.syncGroupAssociation(anno.id, _deView.model.id);
                      return true;
                  },{
                      onCancel: function(){ dc.app.editor.annotationEditor.hideActiveAnnotations(); }
                  });
              }else {
                  _deView.replacePoint(anno, _view);
                  dc.app.editor.annotationEditor.syncGroupAssociation(anno.id, this.model.id);
              }
          }else{
              //If the group selected is this group, find and highlight point; otherwise save and reload proper group
              if( anno.group_id == _deView.model.id ) {
                  _view = _.find(this.pointViewList, function(view){ return view.model.id == anno.id; });
                  if( _view ){ _view.highlight(); }
              }else {
                  this.save(function () {
                      _deView.reloadPoints(anno.group_id, anno.id);
                  });
              }
          }
      }else{
          _view = _.find(this.pointViewList, function(view){ return view.model.get('location') == anno.location; });
          _view.highlight(anno);
      }
  },


  handleAnnotationCancel: function() {
    this.clearAnnotations();
  },


  //markComplete: If confirmed, save current data and send request to mark complete; handle error if not able to mark complete
  markComplete: function() {
      _thisView = this;
      dc.ui.Dialog.confirm(_.t('return_to_de'), function(){
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
  },

  //Handle clicking of file note
  handleFileNote: function(){
    dc.ui.QAFileNoteDialog.open(this.docModel);
  }

});

dc.ui.QAAnnotationListing = dc.ui.BaseAnnotationListing.extend({

    showApprove: true,
    showReject:  true,

    initialize: function() {
      dc.ui.BaseAnnotationListing.prototype.initialize.apply(this, arguments);

      this.events['click .approve_item'] = 'handleApprove';
      this.events['click .reject_item'] = 'handleReject';
      this.events['click .point_note'] = 'handleEditNote';
    },

    render : function() {
        dc.ui.BaseAnnotationListing.prototype.render.apply(this, arguments);

        this.$('.clone_item').hide();
        this.$('.delete_item').hide();

        if( this.model.get('approved') ) { this.setApprove(); }
        if( this.model.get('qa_reject_note') != null ){ this.setReject(); }

        return this;
    },


    //setApprove: Sets UI to approved
    setApprove: function(){
      this.$('.approve_item').hide();
      this.$('.point_note').hide();
      this.$('.row_status').removeClass('incomplete');
      this.$('.row_status').removeClass('rejected');
      this.$('.row_status').addClass('complete');
      this.$('.reject_item').show().css('display', 'inline-block');
    },


    //setReject: Sets UI to rejected
    setReject: function(){
        this.$('.reject_item').hide();
        this.$('.row_status').removeClass('incomplete');
        this.$('.row_status').removeClass('complete');
        this.$('.row_status').addClass('rejected');
        this.$('.approve_item').show().css('display', 'inline-block');
        this.$('.point_note').show().css('display', 'inline-block');
    },


    handleApprove: function(){
        this.model.set({approved: true, qa_reject_note: null});
        this.setApprove(false);
        this.trigger('qaAddress', this);
    },


    handleReject: function(){
        var _thisView = this;
        dc.ui.QARejectDialog.open(_thisView.model, false, function(){
            _thisView.setReject();
            _thisView.trigger('qaAddress', _thisView);
        });
    },


    handleEditNote: function(){
        var _thisView = this;
        dc.ui.QARejectDialog.open(_thisView.model, function(){});
    }
});

dc.ui.QACompleteDialog = dc.ui.Dialog.extend({

  id                : 'qa_complete_dialog',
  className         : 'dialog tempalog',
  template          : null,
  parentTemplate    : null,
  fieldViewList     : [],

  dataEvents : {
      'click .cancel'     : 'close',
      'click .ok'         : 'save'
  },


  constructor : function(docModel, to_supp_de) {
    this.document    = docModel;
    this.to_supp_de  = to_supp_de;
    this.events      = _.extend({}, this.events, this.dataEvents);
    this._mainJST = JST['qa_complete_dialog'];
    _.bindAll(this, 'render', 'handleMarkCompleteError');
    dc.ui.Dialog.call(this, {mode : 'custom', title : _.t('complete_qa'), saveText : _.t('save') });

    _thisView = this;

    this.render();

    $(document.body).append(this.el);
  },


  render : function() {
    //Base dialog object needs
    dc.ui.Dialog.prototype.render.call(this);
    this._container = this.$('.custom');

    //Main template
    this._container.html(this._mainJST({to_supp_de: this.to_supp_de}));

    return this;
  },


  save : function(success) {
    var qc_rating = parseInt($("#qc_rating").val());
    var qa_note = $('#qa_note').val();
    if( qc_rating < 3 && qa_note.length == 0 ){
        this.error(_.t('explain_rating_error'));
        return false;
    }

    //Trigger save
    this.document.markComplete({
        data: {
          'self_assign': $("#self_assign").prop('checked'),
          'request_supp_work': $("#request_supp_work").prop('checked'),
          'qc_rating': qc_rating,
          'qa_note': qa_note
        },
        success: function() {
          if(window.opener){ window.opener.location.reload(); }
          window.close();
        },
        error: this.handleMarkCompleteError
      });
  },


  handleMarkCompleteError: function(responseData){
    if( responseData.errorText == 'has_supp_de_claim' ){
        this.error(_.t('existing_supp_de_claim'));
    }else if(responseData.errorText == 'no_supp_confirm') {
      //If error is that the user has asked to bypass Supp DE, get confirmation
      var qc_rating = parseInt($("#qc_rating").val());
      var qa_note = $('#qa_note').val();
      dc.ui.QANoSuppConfirmDialog.open(this.document, responseData.data.notes, qc_rating, qa_note);
      this.close();
    }
  }

}, {

  // This static method is used for conveniently opening the dialog for
  // any selected template.
  open : function(document, to_supp_de) {
    new dc.ui.QACompleteDialog(document, to_supp_de);
  }

});

dc.ui.ViewerQAControlPanel = dc.ui.ViewerBaseControlPanel.extend({
  id :                  'control_panel',
  AnnoClass:            FuncUtils.stringToFunction("dc.ui.QAAnnotationListing"),
  //Initialize: base model for this view is the group that is being displayed
  initialize : function() {
     dc.ui.ViewerBaseControlPanel.prototype.initialize.apply(this, arguments);
    _.bindAll(this, 'handleMarkCompleteResponse');

    this.events['click .approve_all'] = 'approveAll';
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
        var _groupView = _deView.addGroup({
            model: model,
            showClone: false,
            showEdit: false,
            showDelete: false,
            showSubitemStatus: true,
            showApproval: true,
            showApprovalStatus: true
        });
    });
    this.$('#group_section').html(_.pluck(this.groupViewList, 'el'));

    //Annotations
    this.model.annotations.each(function(model, index) {
        _anno = _deView.addDataPoint(model, (model.id == annoId));
        _deView.listenTo(_anno, 'qaAddress', _deView.handleQAAddress);
    });
    this.$('#annotation_section').html(_.pluck(this.pointViewList,'el'));

    return this.el;
  },


  //Save: save all valid data point changes if no errors
  save: function(success) {
    var _deView = this;

    this.model.annotations.pushAll({success: success});
  },


  //Handle click of 'mark complete' button
  markComplete: function(){
    var _thisView = this;
    this.save(function() {
      _thisView.docModel.markComplete({
        data: {},
        error: _thisView.handleMarkCompleteResponse,
        success: function(){
          if(window.opener){ window.opener.location.reload(); }
          window.close();
        }
      });
    });
  },


  //Handle error response from mark complete call
  handleMarkCompleteResponse: function(responseData) {
    //If there is an error..
    if (responseData.errorText == 'no_qc_rating') {
      //And that error is no QC rating, open prompt window to collect it
      dc.ui.QACompleteDialog.open(this.docModel, responseData.data.supp_de);
    }else{
      //Otherwise, display error in alert and reload to any passed data
      this.reloadPoints(responseData.data.group_id, responseData.data.id);
      dc.ui.Dialog.alert(responseData.errorText);
    }
  },


  //When annotation selected in DV, find a data point that's waiting for DV input or matches the annotation and pass response to it.  If neither,
  //reload to a group that contains a point that matches it
  handleAnnotationSelect: function(anno){
    var _deView = this;

    //If the group selected is this group, find and highlight point; otherwise save and reload proper group
    if( anno.group_id == this.model.id ){
      _view = _.find(this.pointViewList, function(view){ return view.model.id == anno.id; });
      _view.highlight();
    }else {
      this.save(function () {
          _deView.reloadPoints(anno.group_id, anno.id);
      });
    }
  },


  //Approve all unaddressed annotation
  approveAll: function(){
    var allAnnosApproved = true;
    var allGroupsApproved = true;

    for(var i=0; i < this.pointViewList.length; i++){
      if( this.pointViewList[i].model.get('approved') ){
        //Track if anything is rejected
        if( this.pointViewList[i].model.get('qa_reject_note') != null ){ allAnnosApproved = false; }
      }else{
        this.pointViewList[i].handleApprove();
      }
    }

    for(var i=0; i < this.model.children.models.length; i++){
      if( !this.model.children.models[i].get('approved') || this.model.children.models[i].get('qa_reject_note') ){ allGroupsApproved = false;}
    }

    if( allAnnosApproved && allGroupsApproved && !this.model.get('base') ){
      //If all approved, and group isn't approved, approve it
      if( !this.model.get('approved') ){ this.model.set({approved: true, qa_reject_note: null}); }
      this.model.update_approval(false, this.changeGroupView(this.model.get('parent_id')));
    }
  },


  //If anno approved/rejected, mark as addressed in DV
  handleQAAddress: function(annoView){
    dc.app.editor.annotationEditor.markApproval(annoView.model.id, this.model.id, true);
  },


  //Handle clicking of file note
  handleFileNote: function(){
      dc.ui.QAFileNoteDialog.open(this.docModel);
  }
});

dc.ui.QAFileNoteDialog = dc.ui.Dialog.extend({

  id                : 'file_note_dialog',
  className         : 'dialog tempalog',
  template          : null,
  parentTemplate    : null,
  fieldViewList     : [],

  dataEvents : {
      'click .cancel'     : 'close',
      'click .ok'         : 'save'
  },


  constructor : function(document) {
    this.document    = document;
    this.events         = _.extend({}, this.events, this.dataEvents);
    this._mainJST = JST['qa_file_note_dialog'];
    _.bindAll(this, 'render');
    dc.ui.Dialog.call(this, {mode : 'custom', title : _.t('qa_reject_notes'), saveText : _.t('save') });

    _thisView = this;

    this.render();

    $(document.body).append(this.el);
  },


  render : function() {
    //Base dialog object needs
    dc.ui.Dialog.prototype.render.call(this);
    this._container = this.$('.custom');

    //Main template
    this._container.html(this._mainJST({qa_note: this.document.get('qa_note')}));

    return this;
  },


  save : function(success) {
    _thisView = this;

    this.document.set({qa_note: $('#qa_note').val()});
    this.document.save({},{success: function() {
        _thisView.close();
    }});
  }

}, {

  // This static method is used for conveniently opening the dialog for
  // any selected template.
  open : function(document) {
    new dc.ui.QAFileNoteDialog(document);
  }

});

dc.ui.QANoSuppConfirmDialog = dc.ui.Dialog.extend({

  id                : 'qa_no_supp_confirm_dialog',
  className         : 'dialog tempalog',
  template          : null,
  parentTemplate    : null,
  noteViewList      : [],


  dataEvents : {
      'click .cancel'     : 'close',
      'click .ok'         : 'save'
  },


  constructor : function(document, noteList, qc_rating, qa_note) {
    this.document           = document;
    this.noteList           = noteList;
    this.qc_rating          = qc_rating;
    this.qa_note            = qa_note;
    this.events         = _.extend({}, this.events, this.dataEvents);
    this._mainJST = JST['qa_no_supp_confirm'];
    _.bindAll(this, 'render');
    dc.ui.Dialog.call(this, {
        mode : 'custom',
        title : _.t('qa_confirm_supp_opt_out'),
        saveText : 'OK',
        noOverlay: true,
        noOK: false
    });

    _thisView = this;

    this.render();

    $(document.body).append(this.el);
  },


  render : function() {
    var _thisView = this;

    //Base dialog object needs
    dc.ui.Dialog.prototype.render.call(this);
    this._container = this.$('.custom');

    //Main template
    var qa_note = this.document.get('qa_note') ? this.document.get('qa_note').replace(/(?:\r\n|\r|\n)/g, '<br />') : null;
    this._container.html(this._mainJST({qa_note: qa_note}));

    //Notes
    this.noteViewList = [];
    for(var i=0; i < this.noteList.length; i++){
      model = new dc.model.FileNote(this.noteList[i]);
      _view = new dc.ui.FileNoteListing({model: model});
      _thisView.noteViewList.push(_view);
      _view.render(false);
    }

    $('#note_section table').html(_.pluck(this.noteViewList,'el'));

    return this;
  },


  save : function(success) {
    _thisView = this;

    this.document.markComplete({
      data: {
        'skip_de': true,
        'qc_rating': this.qc_rating,
        'qa_note': this.qa_note
      },
      success: function() {
        if(window.opener){ window.opener.location.reload(); }
        window.close();
      }
    });
  },


  requestPointReload : function(payload){
    this.trigger('requestPointReload', payload);
  }

}, {

  // This static method is used for conveniently opening the dialog for
  // any selected template.
  open : function(document, noteList, qc_rating, qa_note) {
    new dc.ui.QANoSuppConfirmDialog(document, noteList, qc_rating, qa_note);
  }

});

dc.ui.QARejectDialog = dc.ui.Dialog.extend({

  id                : 'qa_reject_dialog',
  className         : 'dialog tempalog',
  template          : null,
  parentTemplate    : null,
  fieldViewList     : [],

  dataEvents : {
      'click .cancel'     : 'close',
      'click .ok'         : 'save'
  },


  constructor : function(anno, is_group, success) {
    this.annotation   = anno;
    this.is_group = is_group;
    this.success = success;
    this.events         = _.extend({}, this.events, this.dataEvents);
    this._mainJST = JST['qa_reject_dialog'];
    _.bindAll(this, 'render');
    dc.ui.Dialog.call(this, {mode : 'custom', title : _.t('reject_point'), saveText : _.t('save') });

    _thisView = this;

    this.render();

    $(document.body).append(this.el);
  },


  render : function() {
    //Base dialog object needs
    dc.ui.Dialog.prototype.render.call(this);
    this._container = this.$('.custom');

    //Main template
    this._container.html(this._mainJST({
      qa_point_note: this.annotation.get('qa_reject_note') ? this.annotation.get('qa_reject_note') : '',
      is_group: this.is_group
    }));

    return this;
  },


  save : function(success) {
    var qa_note = $('#qa_point_note').val();
    var subitems_too = $('#subitems_too') ? $('#subitems_too').is(':checked') : false;

    //If no note is entered, error
    if( qa_note.length <= 0 ){
        this.error(_.t('blank_note_error'));
        return false;
    }

    this.annotation.set({approved: true, qa_reject_note: qa_note});
    this.success.call(this, subitems_too);
    this.close();
  }

}, {

  // This static method is used for conveniently opening the dialog for
  // any selected template.
  open : function(anno, is_group, success) {
    new dc.ui.QARejectDialog(anno, is_group, success);
  }

});

dc.ui.QCAnnotationListing = dc.ui.BaseAnnotationListing.extend({

  render : function() {
    dc.ui.BaseAnnotationListing.prototype.render.apply(this, arguments);

    this.$('.clone_item').hide();
    this.$('.row_status').removeClass('incomplete');

    if( this.model.get('ag_iteration') != currentDocumentModel.iteration ){
      this.$('.delete_item').hide();
    }

    return this;
  },


  //Delete override; removes from QC instead
  deletePoint: function() {
    var _thisAnno = this;

    var success = function(response){
        _thisAnno.trigger('removeFromQC', _thisAnno, response.group_id);
        $(_thisAnno.el).remove();
    };

    if( this.model.changedAttributes() ) {
        //If not changed, then never saved.. just wipe from front end
        success({group_id: this.model.get('based_on_group_id')});
    }else{
        this.model.unapprove({
            group_id: this.group_id,
            success: success
        });
    }
    return true;
  }

});

dc.ui.QCCompleteDialog = dc.ui.Dialog.extend({

  id                : 'qc_complete_dialog',
  className         : 'dialog tempalog',
  template          : null,
  parentTemplate    : null,
  fieldViewList     : [],

  dataEvents : {
      'click .cancel'     : 'close',
      'click .ok'         : 'save'
  },


  constructor : function(document, is_supp) {
    this.document    = document;
    this.events      = _.extend({}, this.events, this.dataEvents);
    this.is_supp     = is_supp == null ? false : is_supp;
    this._mainJST = JST['qc_complete_dialog'];
    _.bindAll(this, 'render');
    dc.ui.Dialog.call(this, {mode : 'custom', title : _.t('complete_qc'), saveText : _.t('save') });

    _thisView = this;

    this.render();

    $(document.body).append(this.el);
  },


  render : function() {
    //Base dialog object needs
    dc.ui.Dialog.prototype.render.call(this);
    this._container = this.$('.custom');

    //Main template
    this._container.html(this._mainJST({is_supp: this.is_supp}));

    return this;
  },


  save : function(success) {
    _thisView = this;

    //If any rating <= 3, and no note is given, error
    var rating_one = parseInt($("#de_one_review").val());
    var rating_two = parseInt($("#de_two_review").val());
    var file_note = $('#qc_file_note').val();
    if( rating_one < 3 && file_note.length == 0 ){
        this.error(_.t('explain_rating_error'));
        return false;
    }

    if( !this.is_supp && rating_two < 3 && file_note.length == 0 ){
      this.error(_.t('explain_rating_error'));
      return false;
    }

    //Trigger save
    this.document.markComplete({
        data: {
            'de_one_rating': rating_one,
            'de_two_rating': rating_two,
            'qc_note':       file_note
        },
        success: function() {
          if(window.opener){ window.opener.location.reload(); }
          window.close();
        }
      });
  }

}, {

  // This static method is used for conveniently opening the dialog for
  // any selected template.
  open : function(document, is_supp) {
    new dc.ui.QCCompleteDialog(document, is_supp);
  }

});

dc.ui.ViewerQCControlPanel = Backbone.View.extend({

  id :                  'control_panel',

  //Initialize: base model for this view is the group that is being displayed
  initialize : function() {
    this.deOneSubpanel = new dc.ui.ViewerQcDeSubpanel({de: 1});
    this.qcSubpanel = new dc.ui.ViewerQcSubpanel();
    this.deTwoSubpanel = new dc.ui.ViewerQcDeSubpanel({de: 2});

    this.listenTo(dc.app.editor.annotationEditor, 'annotationSelected', this.handleAnnotationSelect);

    this.listenTo(this.deOneSubpanel, 'requestAnnotationClone', this.passAnnoCloneRequest);
    this.listenTo(this.deOneSubpanel, 'requestGroupClone', this.handleGroupCloneRequest);
    this.listenTo(this.deOneSubpanel, 'requestAnnotationMatch', this.handleAnnotationMatchRequest);
    this.listenTo(this.deTwoSubpanel, 'requestAnnotationClone', this.passAnnoCloneRequest);
    this.listenTo(this.deTwoSubpanel, 'requestGroupClone', this.handleGroupCloneRequest);
    this.listenTo(this.deTwoSubpanel, 'requestAnnotationMatch', this.handleAnnotationMatchRequest);
    this.listenTo(this.qcSubpanel, 'removeFromQC', this.handleRemoveFromQC);
    this.listenTo(this.qcSubpanel, 'groupDeleted', this.refreshDE);

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
        annos[i].set({approved_count: annos[i].get('approved_count') + 1});
        dc.app.editor.annotationEditor.markApproval(annos[i].id, group_id, true);
      }else{
        failedTitleString += "<br>\'" + annos[i].get('title') + "\'";
      }
    }

    var handleSuccess = function(){
      if(backup) {
        if (de_requester == 1) { thisView.deOneSubpanel.handleApprovalSuccess(); }
        if (de_requester == 2) { thisView.deTwoSubpanel.handleApprovalSuccess(); }
        thisView.qcSubpanel.handleApprovalSuccess();
      }
    };

    if(failedTitleString.length > 0){ dc.ui.Dialog.alert(_.t('duplicate_titles_fail', failedTitleString)); }
    else{ this.qcSubpanel.save(handleSuccess); }

  },


  //Pass along group clone request and reload this view to cloned group
  handleGroupCloneRequest: function(group) {
    var _thisView = this;
    group.clone(this.qcSubpanel.model.id, function(response){
       _thisView.qcSubpanel.save(function() {
           _thisView.qcSubpanel.reloadPoints(response.id);
       });
    });
  },


  //If anno is passed, have DV show it as unapproved.  Refresh DE views.
  handleRemoveFromQC: function(anno, group_id){
    if( anno ){ dc.app.editor.annotationEditor.markApproval(anno.id, group_id, false); }
    this.refreshDE(anno);
  },


  //Refresh DE views
  refreshDE: function(anno){
    this.deOneSubpanel.reloadCurrent();
    this.deTwoSubpanel.reloadCurrent();
  }
});

dc.ui.QCDEAnnotationListing = dc.ui.BaseAnnotationListing.extend({

  showMatch: true,

  initialize: function() {
      this.listenTo(this.model, 'change', this.render);

      dc.ui.BaseAnnotationListing.prototype.initialize.apply(this, arguments);
  },


  render : function() {
    dc.ui.BaseAnnotationListing.prototype.render.apply(this, arguments);

    this.$('.delete_item').hide();

    //Match status
    if( this.model.get('match_strength') == 2 ) { this.$('.row_match').addClass('full'); }
    if( this.model.get('match_strength') == 1 ) { this.$('.row_match').addClass('partial'); }

    //Show rejection if previously rejected
    if( this.model.get('qa_reject_note') != null ){
      this.$('.row_status').removeClass('incomplete');
      this.$('.row_status').addClass('rejected');
      this.$('.annotation_listing').addClass('rejected');
    }else {
      //Otherwise base view on approval count
      if(this.model.get('approved_count') > 0 || this.model.get('approved')) {
        this.$('.row_status').removeClass('incomplete');
        this.$('.row_status').addClass('complete');
      }
    }

    return this;
  },


  //prepareForClone: close out any active annotating and set self in 'waiting for clone' status
  prepareForClone : function() {
      dc.app.editor.annotationEditor.close();
      this.trigger('requestAnnotationClone', this.model);
  }

});

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
    if(!this.model.children || this.model.children.length <= 0){ this.$('#group_section').html('<div class="group_listing">(no groups)</div>'); }
    else {
      this.model.children.each(function (model, index) {
        _deView.addGroup({
          model: model,
          showEdit: false,
          showDelete: false,
          showSubitemStatus: true,
          strikethrough: !(model.get('qa_reject_note') == null)
        });
      });
      this.$('#group_section').html(_.pluck(this.groupViewList, 'el'));
    }

    //Annotations
    if(!this.model.annotations || this.model.annotations.length <= 0){  this.$('#annotation_section').html('<div class="group_listing">(no points)</div>'); }
    else {
      this.model.annotations.each(function (model, index) {
        _annoView = _deView.addDataPoint(model, (model.id == annoId));
        _deView.listenTo(_annoView, 'requestAnnotationClone', _deView.handleAnnoCloneRequest);
      });
      this.$('#annotation_section').html(_.pluck(this.pointViewList, 'el'));
    }

    return this.el;
  },


  //When annotation selected in DV, find a data point that's waiting for DV input or matches the annotation and pass response to it.  If neither,
  //reload to a group that contains a point that matches it
  handleAnnotationSelect: function(anno){
    var _deView = this;

    //If the anno has a match, trigger match logic
    if( anno.match_id != null ){ this.trigger('requestAnnotationMatch', anno, this.reloadParams.de); }

    //If the group selected is this group, find and highlight point; otherwise save and reload proper group
    if( _.where(anno.groups, {group_id: _deView.model.id}).length > 0 ) {
      _view = _.find(this.pointViewList, function(view){ return view.model.id == anno.id; });
      if( _view ){ _view.highlight(); }
    }else {
      _deView.reloadPoints(anno.groups[0].group_id, anno.id);
    }
  },


  //Reload to group containing an annotation's match when it's selected in the other window.
  handleMatchRequest: function(anno){
    var _thisView = this;
    match = new dc.model.Annotation({document_id: this.docModel.id, id: anno.match_id});
    match.fetch({success: function(anno){
      _thisView.reloadPoints(anno.get('groups')[0].group_id);
    }});

  },


  //Listens for an annotation to request to be cloned and passes it to anything
  //listening to events from this control panel
  //Takes in an array of annotations, and whether to indicate you want to back up a level if approval succeeds
  passAnnoCloneRequest: function(annos, backup){
    this.trigger('requestAnnotationClone', annos, this.model.id, backup, this.reloadParams.de);
  },


  handleAnnoCloneRequest: function(annoView){
    this.passAnnoCloneRequest([annoView], false);
  },


  //Request approval/clone for all current annotations
  approveAll: function(anno){
    //Calculate whether you would like to back up a level if approval succeeds
    var groupsApproved = true;

    //If all groups are approved, refresh to parent group
    for(var i=0; i < this.model.children.models.length; i++){
      if( this.model.children.models[i].get('unapproved_count') > 0 ){
        groupsApproved = false;
        break;
      }
    }

    this.passAnnoCloneRequest(this.model.annotations.models, groupsApproved);
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
  },


  //Handle message from QC that approval succeeded
  handleApprovalSuccess: function(){
    this.changeGroupView(this.model.get('parent_id'));
  }

});

dc.ui.QCRejectDialog = dc.ui.Dialog.extend({

  id                : 'qc_reject_dialog',
  className         : 'dialog tempalog',
  template          : null,
  parentTemplate    : null,
  fieldViewList     : [],

  dataEvents : {
      'click .cancel'     : 'close',
      'click .ok'         : 'save'
  },


  constructor : function(document_id) {
    this.document_id    = document_id;
    this.events         = _.extend({}, this.events, this.dataEvents);
    this._mainJST = JST['qc_reject_dialog'];
    _.bindAll(this, 'render');
    dc.ui.Dialog.call(this, {mode : 'custom', title : _.t('reject_de'), saveText : _.t('save') });

    _thisView = this;

    this.render();

    $(document.body).append(this.el);
  },


  render : function() {
    //Base dialog object needs
    dc.ui.Dialog.prototype.render.call(this);
    this._container = this.$('.custom');

    //Main template
    this._container.html(this._mainJST({}));

    return this;
  },


  save : function(success) {
    _thisView = this;

    //If no selection is made, error
    var selected = $("input[type='radio']:checked").val();
    if( !selected ){
        this.error(_.t('reject_de_not_selected'));
        return false;
    }

    //Trigger save
    $.ajax({
        url         : '/documents/' + this.document_id + '/reject_de',
        contentType : 'application/json; charset=utf-8',
        type        : 'put',
        data        : JSON.stringify({'de': selected}),
        success     : function(response){
          if(window.opener){ window.opener.location.reload(); }
          window.close();
        }
    })
  }

}, {

  // This static method is used for conveniently opening the dialog for
  // any selected template.
  open : function(document_id) {
    new dc.ui.QCRejectDialog(document_id);
  }

});

dc.ui.ViewerQcSubpanel = dc.ui.ViewerBaseControlPanel.extend({

  AnnoClass:    FuncUtils.stringToFunction("dc.ui.QCAnnotationListing"),

  reloadParams: {qc: true},


  initialize: function(options) {
      dc.ui.ViewerBaseControlPanel.prototype.initialize.apply(this, arguments);

      this.events['click .reject'] = 'rejectDE';
  },


  render : function(annoId) {
    var _deView           = this;
    var _mainJST = JST['qc_subpanel'];
    var templateName    = this.model.get('group_template') == null ? null : this.model.get('group_template').name;
    $(this.el).html(_mainJST({template_name: templateName ? templateName.substring(0,39) : null}));

    //Group Navigation
    this.$('.group_navigation').html(this.generateGroupNav());

    //Group Listings
    this.model.children.each(function(model, index){
      var _canEdit = model.get('iteration') == currentDocumentModel.iteration;
      _deView.addGroup({
          model: model,
          showStatus: false,
          showClone: false,
          showEdit: _canEdit,
          showDelete: _canEdit
      });
    });
    this.$('#group_section').html(_.pluck(this.groupViewList, 'el'));

    //Annotations
    this.model.annotations.each(function(model, index) {
       _anno = _deView.addDataPoint(model, (model.id == annoId));
       _deView.listenTo(_anno, 'removeFromQC', _deView.passRemoveFromQC);
    });
    this.$('#annotation_section').html(_.pluck(this.pointViewList,'el'));

    this.$('.file_note').hide();

    return this.el;
  },


  //Save: save all valid data point changes if no errors
  save: function(success) {
    var _deView = this;

    this.model.annotations.pushAll({success: function(){
      _deView.syncDV(success)
    }});
  },


  //Take in DE point, and make an approved copy if it doesn't already exist
  approveDEPoint: function(anno, group_id){
    if( this.hasTitle(anno.get('title')) ){ return false; }
    else {
        anno.set({
          based_on: anno.get('annotation_group_id'),
          based_on_group_id: group_id,
          iteration: currentDocumentModel.iteration
        });
        var _view = this.createDataPointCopy(anno.attributes);
        this.listenTo(_view, 'removeFromQC', this.passRemoveFromQC);
        return true;
    }
  },


  //Send document back to DE
  rejectDE: function(){
      dc.ui.QCRejectDialog.open(this.model.get('document_id'));
  },


  //Remove qc point model/view and pass removeFromQC event up the chain
  passRemoveFromQC: function(annoView, group_id) {
      var anno = annoView.model;
      this.model.annotations.remove(anno);

      for(var i=0; i < this.pointViewList.length; i++){
        if( this.pointViewList[i].cid == annoView.cid ){ this.pointViewList.splice(i, 1); }
      }

      this.trigger('removeFromQC', anno, group_id);
  },


  //Pass group delete notification up
  handleGroupDelete: function(group) {
      this.reloadAnnotations();
      this.trigger('groupDeleted', group);
  },


  //Handle click of 'mark complete' button
  markComplete: function(){
      var _thisView = this;
      this.save(function(){ dc.ui.QCCompleteDialog.open(_thisView.docModel); });
  },


  //Handle message from QC that approval succeeded
  handleApprovalSuccess: function(){
      this.changeGroupView(this.model.get('parent_id'));
  }
});

dc.ui.SuppDEAnnotationListing = dc.ui.BaseAnnotationListing.extend({

  render : function() {
    dc.ui.BaseAnnotationListing.prototype.render.apply(this, arguments);

    //Clone/Delete
    if( this.model.get('approved') || this.model.get('qa_reject_note') ){
      this.$('.clone_item').hide();
      this.$('.delete_item').hide();
    }

    //Approval
    if( this.model.get('approved') ){ this.$('.row_status').removeClass('incomplete'); }
    if( this.model.get('qa_reject_note') != null ){
      this.$('.row_status').addClass('rejected');
      this.$('.annotation_listing').addClass('rejected');
    }else {
      this.$('.row_status').addClass('complete');
    }

    return this;
  },

  //prepareForAnnotation: signal DV to create annotation and wait for response
  prepareForAnnotation : function() {
    var _thisView = this;
    var _canEdit = this.model.get('iteration') == currentDocumentModel.iteration;

    dc.app.editor.annotationEditor.open(this.model, this.group_id, _canEdit, function(){
      _thisView.openDocumentTab();
      _thisView.highlight();
    });
  }
});

dc.ui.ViewerSuppDEControlPanel = dc.ui.ViewerDEControlPanel.extend({

  AnnoClass: FuncUtils.stringToFunction("dc.ui.SuppDEAnnotationListing"),

    initialize: function(options) {
      dc.ui.ViewerDEControlPanel.prototype.initialize.apply(this, arguments);

      _.bindAll(this, 'releaseFileNote');

      this.noteList = new dc.model.FileNotes({document_id: this.docModel.id});
      this.noteList.fetch();
    },

    render : function(annoId) {
      var _deView           = this;
      var _mainJST = JST['supp_de_control_panel'];
      var templateName    = this.model.get('group_template') == null ? null : this.model.get('group_template').name;
      $(this.el).html(_mainJST({template_name: templateName ? templateName.substring(0,39) : null}));

      //Group Navigation
      $('.group_navigation').html(this.generateGroupNav());

      //Group Listings
      this.model.children.each(function(model, index){
        can_edit = !model.get('approved');
        _grp = _deView.addGroup({
          model: model,
          showClone: true,
          showEdit: can_edit ,
          showDelete: can_edit,
          showApproval: false,
          showApprovalStatus: true,
          strikethrough: !(model.get('qa_reject_note') == null)
        });
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
      var _deView = this;

      //Clear error class from all inputs
      $('input').removeClass('error');
      var _hasErrors = false;

      //Check for duplicate annotation titles.  If found, throw error and exit
      var titleList = [];
      for(var i=0; i < this.pointViewList.length; i++){
        if( this.pointViewList[i].model.get('qa_reject_note') == null ) {
          if ($.inArray(this.pointViewList[i].model.get('title'), titleList) > 0) {
            dc.ui.Dialog.alert(_.t('duplicate_titles', this.pointViewList[i].model.get('title')));
            return false;
          } else {
            titleList.push(this.pointViewList[i].model.get('title'));
          }
        }
      }

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


    //When annotation selected in DV, find a data point that's waiting for DV input or matches the annotation and pass response to it.  If neither,
    //reload to a group that contains a point that matches it
    handleAnnotationSelect: function(anno){
      var _deView = this;
      //If previously saved point (has ID assigned)..
      if( anno.id ){
          //If a data point is waiting for a clone response, pass response, then create copy
          var _view = _.find(this.pointViewList, function(view){ return view.waitingForClone; });
          if( _view ) {
              //First check that another anno with the same title doesn't exist; if so, prompt
              var _dupeView = _.find(this.pointViewList, function(view){ return (anno.title == view.model.get('title')) && !view.waitingForClone });
              if( _dupeView ){
                  dc.ui.Dialog.confirm(_.t('duplicate_point_error'), function(){
                      _dupeView.deletePoint();
                      _deView.replacePoint(anno, _view);
                      dc.app.editor.annotationEditor.syncGroupAssociation(anno.id, _deView.model.id);
                      return true;
                  },{
                      onCancel: function(){ dc.app.editor.annotationEditor.hideActiveAnnotations(); }
                  });
              }else {
                  _deView.replacePoint(anno, _view);
                  dc.app.editor.annotationEditor.syncGroupAssociation(anno.id, this.model.id);
              }
          }else{
              //If the group selected is this group, find and highlight point; otherwise save and reload proper group
              if( anno.groups[0].group_id == _deView.model.id ) {
                  _view = _.find(this.pointViewList, function(view){ return view.model.id == anno.id; });
                  if( _view ){ _view.highlight(); }
              }else {
                  this.save(function () {
                      _deView.reloadPoints(anno.groups[0].group_id, anno.id);
                  });
              }
          }
      }else{
          _view = _.find(this.pointViewList, function(view){ return view.model.get('location') == anno.location; });
          _view.highlight(anno);
      }
    },


    handleFileNote: function() {
        if( !this.fileNoteDialog ){
          this.fileNoteDialog = new dc.ui.FileNoteDialog(this.docModel, this.noteList, this.releaseFileNote, true);
          this.listenTo(this.fileNoteDialog, 'requestPointReload', this.handleReloadRequest);
        }
    },


    //Function to trigger that file note dialog is gone
    releaseFileNote: function() {
        this.fileNoteDialog = null;
    },


    handleReloadRequest: function(annoGroupInfo) {
      var _thisView = this;
      this.save(function () {
        _thisView.reloadPoints(annoGroupInfo.group_id, annoGroupInfo.id, true);
      });
    },


    //Overload for create new point; don't allow in rejected group
    createNewDataPoint: function() {
      if( this.model.get('qa_reject_note') ){
        dc.ui.Dialog.alert(_.t('create_in_rejected_group'));
      }else {
        dc.ui.ViewerDEControlPanel.prototype.createNewDataPoint.call(this);
      }
    }

});

dc.ui.SuppQAAnnotationListing = dc.ui.QAAnnotationListing.extend({

  showApprove: true,
  showReject:  true,

  render : function() {
    dc.ui.BaseAnnotationListing.prototype.render.apply(this, arguments);

    this.$('.clone_item').hide();
    this.$('.delete_item').hide();

    if (this.model.get('approved')) { this.setApprove(); }
    if (this.model.get('qa_reject_note') != null) { this.setReject(); }

    if( this.model.get('ag_iteration') != currentDocumentModel.iteration ){ this.$('.reject_item').hide(); }

    return this;
  }

});

dc.ui.ViewerSuppQAControlPanel = dc.ui.ViewerQAControlPanel.extend({
  id :                  'control_panel',
  AnnoClass:            FuncUtils.stringToFunction("dc.ui.SuppQAAnnotationListing"),
  //Initialize: base model for this view is the group that is being displayed
  initialize : function() {
     dc.ui.ViewerQAControlPanel.prototype.initialize.apply(this, arguments);
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
        var _groupView = _deView.addGroup({
            model: model,
            showClone: false,
            showEdit: false,
            showDelete: false,
            showSubitemStatus: true,
            showApproval: (model.get('iteration') == currentDocumentModel.iteration),
            showApprovalStatus: true
        });
    });
    this.$('#group_section').html(_.pluck(this.groupViewList, 'el'));

    //Annotations
    this.model.annotations.each(function(model, index) {
        _anno = _deView.addDataPoint(model, (model.id == annoId));
        _deView.listenTo(_anno, 'qaAddress', _deView.handleQAAddress);
    });
    this.$('#annotation_section').html(_.pluck(this.pointViewList,'el'));

    return this.el;
  }

});

dc.ui.ViewerSuppQCControlPanel = dc.ui.ViewerQCControlPanel.extend({

  id :                  'control_panel',

  //Initialize: base model for this view is the group that is being displayed
  initialize : function() {
    this.deOneSubpanel = new dc.ui.ViewerQcDeSubpanel({de: 1});
    this.qcSubpanel = new dc.ui.ViewerSuppQcSubpanel();
    this.deTwoSubpanel = new dc.ui.ViewerQcDeSubpanel({de: 2});

    this.listenTo(dc.app.editor.annotationEditor, 'annotationSelected', this.handleAnnotationSelect);

    this.listenTo(this.deOneSubpanel, 'requestAnnotationClone', this.passAnnoCloneRequest);
    this.listenTo(this.deOneSubpanel, 'requestGroupClone', this.handleGroupCloneRequest);
    this.listenTo(this.deTwoSubpanel, 'requestAnnotationClone', this.passAnnoCloneRequest);
    this.listenTo(this.deTwoSubpanel, 'requestGroupClone', this.handleGroupCloneRequest);
    this.listenTo(this.qcSubpanel, 'removeFromQC', this.handleRemoveFromQC);
    this.listenTo(this.qcSubpanel, 'groupDeleted', this.refreshDE);
    this.listenTo(this.qcSubpanel, 'requestOriginalDEReload', this.reloadOriginalDE);

    this.render();
  },

  reloadOriginalDE : function(group_id, annotation_id) {
    this.deOneSubpanel.reloadPoints(group_id, annotation_id);
  }
});

dc.ui.ViewerSuppQcSubpanel = dc.ui.ViewerQcSubpanel.extend({

  initialize: function(options) {
    dc.ui.ViewerQcSubpanel.prototype.initialize.apply(this, arguments);

    this.noteList = new dc.model.FileNotes({document_id: this.docModel.id});
    this.noteList.fetch();
  },


  render: function() {
    dc.ui.ViewerQcSubpanel.prototype.render.apply(this, arguments);

    this.$('.file_note').show();
  },


  handleFileNote: function() {
    var _thisView = this;
    if( !this.fileNoteDialog ){
      this.fileNoteDialog = new dc.ui.FileNoteDialog(
          this.docModel,
          this.noteList,
          function(){
            _thisView.fileNoteDialog = null;
          },
          false);
      this.listenTo(this.fileNoteDialog, 'requestPointReload', this.handleReloadRequest);
    }
  },


  handleReloadRequest: function(annoGroupInfo) {
    this.trigger('requestOriginalDEReload', annoGroupInfo.group_id, annoGroupInfo.annotation_id);
  },


  //Send document back to Supp DE
  rejectDE: function(){
    var _thisView = this;
    dc.ui.Dialog.confirm(_.t('reject_supp_de_text'), function(){
      $.ajax({
        url         : '/documents/' + _thisView.docModel.id + '/reject_de',
        contentType : 'application/json; charset=utf-8',
        type        : 'put',
        data        : JSON.stringify({'de': '1'}),
        success     : function(response){ window.close(); }
      });
    });
  },


  //Handle click of 'mark complete' button
  markComplete: function(){
    var _thisView = this;
    this.save(function(){ dc.ui.QCCompleteDialog.open(_thisView.docModel, true); });
  },
});
(function(){
window.JST = window.JST || {};

window.JST['annotation_listing'] = _.template('<div class="annotation_listing" id="annotation-<%=annotation_id%>">\n    <div class="row_match"></div>\n    <div class="row_status incomplete"></div>\n    <div class="annotation_name"><%-title%></div>\n    <div class="annotation_separator">:</div>\n    <div class="annotation_value"><%-content%></div>\n</div>\n<div class="annotation_actions">\n    <div class="editor_icon graph_data" title="Graph Data"></div>\n    <div class="editor_icon clone_item" title="Clone"></div>\n    <div class="editor_icon delete_item" id="delpoint_<%=annotation_id%>" title="Delete"></div>\n    <div class="editor_icon approve_item" title="Approve"></div>\n    <div class="editor_icon reject_item" title="Reject"></div>\n    <div class="editor_icon point_note" title="Note"></div>\n</div>\n\n\n');
window.JST['control_panel'] = _.template('<div class="control_panel_title gradient_light">\n    <div class="button_panel">\n        <div class="new_group">+ New Group</div>\n    </div>\n</div>\n<div class="control_panel_title gradient_light">\n      <span class="group_title">Test</span>&nbsp;&gt;&nbsp;\n      <span class="group_title">Test2</span>\n</div>\n\n<div class="control_panel_title gradient_light">\n  <span class=""><%= _.t(\'document_tools\') %></span>\n</div>\n<% if (isOwner || isReviewer) { %>\n  <div class="public_annotation button">\n    <div class="icon mini_note"></div>\n    <div class="icon cancel_search"></div>\n    <span><%= _.t(\'add_public_note\') %></span>\n  </div>\n  <div id="public_note_guide" class="note_guide" style="display:none;">\n    <%= _.t(\'add_note_instructions\') %>\n    <br /><br />\n    <span class="warn"><%= _.t(\'add_public_note_warn\') %></span>\n  </div>\n<% } %>\n\n<% if (isOwner) { %>\n  <div class="set_sections button"><span><%= _.t(\'edit_sections\') %></span></div>\n\n  <div class="control_panel_title gradient_light">\n    <span class=""><%= _.t(\'page_tools\') %></span>\n  </div>\n  <div class="edit_replace_pages button">\n    <div class="icon cancel_search"></div>\n    <span><%= _.t(\'insert_replace_pages\') %></span>\n  </div>\n  <div id="edit_replace_pages_guide" class="note_guide" style="display:none;">\n    <%= _.t(\'insert_pages_instructions\') %>\n    <br /><br />\n    <%= _.t(\'insert_pages_shift_key\') %>\n  </div>\n  <div class="edit_remove_pages button">\n    <div class="icon cancel_search"></div>\n    <span><%= _.t(\'remove_pages\') %></span>\n  </div>\n  <div id="edit_remove_pages_guide" class="note_guide" style="display:none;">\n    <%= _.t(\'remove_pages_click\') %>\n    <br /><br />\n    <%= _.t(\'remove_pages_done\') %>\n  </div>\n  <div class="edit_reorder_pages button">\n    <div class="icon cancel_search"></div>\n    <span><%= _.t(\'reorder_pages\') %></span>\n  </div>\n  <div id="edit_reorder_pages_guide" class="note_guide" style="display:none;">\n    <%= _.t(\'reorder_pages_instructions\') %>\n    <br /><br />\n    <%= _.t(\'reorder_pages_done\') %>\n  </div>\n  \n  <div class="control_panel_title gradient_light">\n    <span class=""><%= _.t(\'text_tools\') %></span>\n  </div>\n  <div class="edit_page_text button">\n    <div class="icon cancel_search"></div>\n    <span><%= _.t(\'edit_page_text\') %></span>\n  </div>\n  <div id="edit_page_text_guide" class="note_guide" style="display:none;">\n    <%= _.t(\'edit_page_text_instructions\') %>\n    <br /><br />\n    <%= _.t(\'edit_page_text_done\') %>\n  </div>\n  <div class="reprocess_text button">\n    <span><%= _.t(\'reprocess_text\') %></span>\n  </div>\n<% } %>\n\n<div class="control_panel_help">\n   <% \n     help         = \'<a href="/\' + workspacePrefix + \'help" target="_blank">\' +      _.t(\'help_pages\') + \'</a>\';\n     annotation   = \'<a href="/\'+ workspacePrefix + \'help/notes" target="_blank">\' + _.t(\'annotation\') + \'</a>\';\n     modification = \'<a href="/\' + workspacePrefix + \'help/modification" target="_blank">\' + _.t(\'modification\') + \'</a>\';\n   %>\n  <%= _.t(\'tools_help\', help, annotation,  modification ) %>\n</div>\n');
window.JST['de_control_panel'] = _.template('<div class="control_panel_title gradient_light">\n    <div class="button_panel">\n      <div>\n        <div class="cp_button new_group">+ New Group</div>\n        <div class="cp_button new_data">+ New Data</div>\n        <div class="cp_button new_graph">+ New Graph</div>\n      </div>\n      <div>\n        <div class="cp_button save_exit">Save & Exit</div>\n        <div class="cp_button drop_claim">Drop</div>\n        <div class="cp_button mark_complete">Complete</div>\n      </div>\n    </div>\n</div>\n<div class="annotation_notice">ANNOTATING</div>\n<div class="control_panel_title gradient_light group_navigation"></div>\n\n<div class="header"><%=_.t(\'groups\')%></div>\n<div id="group_section"></div>\n<hr>\n<div class="header"><%=_.t(\'data_points\')%>\n<%if(template_name != null){%>\n(Template: <%=template_name%>)\n<div class="help_url_icon"></div>\n<%}%></div>\n<div id="annotation_section"></div>\n\n');
window.JST['document_page_tile'] = _.template('<div class="document_page_tile">\n  <img src="<%= url %>" />\n  <div class="document_page_line">\n    <div class="document_page_tile_remove cancel_search icon"></div>\n    <div class="document_page_tile_number">p. <%= pageNumber %></div>\n  </div>\n</div>');
window.JST['edit_page_text'] = _.template('<div class="edit_page_text">\n\n  <div class="editor_toolbar_controls edit_page_text_holder">\n    <div class="minibutton edit_page_text_confirm_input default not_enabled"><%= _.t(\'save_text\') %></div>\n    <div class="minibutton close_editor"><%= _.t(\'cancel\') %></div>\n  </div>\n  \n  <div class="document_page_tiles"></div>\n  \n  <div class="editor_hint edit_page_text_confirm_info"><%= _.t(\'edit_text_any_page\') %><br /><%= _.t(\'change_page_arrows\') %></div>\n  \n</div>\n\n');
window.JST['extract_control_panel'] = _.template('<div class="control_panel_title gradient_light">\n  <div class="button_panel">\n    <div class="cp_button file_note">File Note</div>\n    <div class="cp_button mark_complete">To DE</div>\n    <div class="cp_button save_exit">Save & Exit</div>\n  </div>\n</div>\n<div class="control_panel_title gradient_light group_navigation"></div>\n\n<div class="header"><%=_.t(\'groups\')%></div>\n<div id="group_section"></div>\n<hr>\n<div class="header"><%=_.t(\'data_points\')%>\n<%if(template_name != null){%>\n(Template: <%=template_name%>)\n<div class="help_url_icon"></div>\n<%}%></div>\n<div id="annotation_section"></div>\n\n');
window.JST['file_note'] = _.template('<td>\n    <div class="row_status incomplete"></div>\n</td>\n<td class="note_text_cell">\n    <div class="note_text"><%=title%></div>\n</td>\n\n<%if( show_approval ){ %>\n<td class="table_icons">\n    <div class="editor_icon approve_item" title="Approve"></div>\n    <div class="editor_icon reject_item" title="Reject"></div>\n</td>\n<% } %>\n\n\n\n\n\n');
window.JST['file_note_dialog'] = _.template('<%if(qa_note){%>\n<div class="file_note_section">\n<%=qa_note%>\n</div>\n<%}%>\n\n<div class="row"></div>\n<div class="anno_note_section" id="note_section">\n<table>\n</table>\n</div>\n\n\n\n\n\n');
window.JST['group_listing'] = _.template('<div class="group_listing" id="grouplist_<%=group_id%>">\n  <div class="subitem_status incomplete"></div>\n  <div class="row_status incomplete"></div>\n  <div class="group_name" id="group_<%=group_id%>"><a><%-name%></a></div>\n  <div class="graph_data editor_icon" title="Graph Data"></div>\n  <div class="edit_group icon edit_glyph editor_icon" title="Edit"></div>\n  <div class="clone_item editor_icon" clonegroup_<%=group_id%>" title="Clone"></div>\n  <div class="delete_item delete_group editor_icon" id="delgroup_<%=group_id%>" title="Delete"></div>\n  <div class="editor_icon approve_item" title="Approve"></div>\n  <div class="editor_icon reject_item" title="Reject"></div>\n  <div class="editor_icon point_note" title="Note"></div>\n</div>\n\n\n');
window.JST['qa_complete_dialog'] = _.template('<div class="row">\n      <%= _.t(\'review_qc_instruct\') %>\n      <select id="qc_rating" style="float:right; position:static;">\n           <option value="1">Poor</option>\n           <option value="2">OK</option>\n           <option value="3" selected="selected">Normal</option>\n           <option value="4">Very Good</option>\n           <option value="5">Fantastic</option>\n       </select>\n</div>\n<div class="row tall">\n    <%=_.t(\'file_note\')%>:\n    <textarea id="qa_note" class="text_area dark small content attribute"></textarea>\n</div>\n\n<%if(to_supp_de){%>\n<div class="row med">\n      <%= _.t(\'qa_complete_instruct\') %>\n</div>\n<div class="two_column_split" >\n    <%=_.t(\'request_supp_work\')%>\n    <input type="checkbox" id="request_supp_work" checked>\n</div>\n<div class="two_column_split" >\n    &nbsp;<%=_.t(\'assign_to_self\')%>\n    <input type="checkbox" id="self_assign">\n</div>\n<%}%>\n\n\n\n\n\n');
window.JST['qa_control_panel'] = _.template('<div class="control_panel_title gradient_light">\n    <div class="button_panel">\n        <div class="cp_button file_note">File Note</div>\n        <div class="cp_button save_exit">Save & Exit</div>\n        <div class="cp_button drop_claim">Drop</div>\n        <div class="cp_button mark_complete">Complete</div>\n    </div>\n</div>\n<div class="control_panel_title gradient_light group_navigation"></div>\n\n<div class="header"><%=_.t(\'groups\')%></div>\n<div id="group_section"></div>\n<hr>\n<div class="header"><%=_.t(\'data_points\')%> <%if(template_name != null){%>(Template: <%=template_name%>)<%}%></div>\n<div id="annotation_section"></div>\n<div><div class="cp_button approve_all"><%=_.t(\'approve_all\')%></div></div>\n\n');
window.JST['qa_file_note_dialog'] = _.template('\n<div class="row">\n      <%= _.t(\'blank_note_error\') %>\n</div>\n<div class="row tall">\n    <%=_.t(\'file_note\')%>:\n    <textarea id="qa_note" class="text_area dark small content attribute"><%=qa_note%></textarea>\n</div>\n\n\n\n\n\n');
window.JST['qa_no_supp_confirm'] = _.template('<%=_.t(\'qa_no_supp_instruct\')%>\n\n<%if(qa_note){%>\n<div class="file_note_section">\n<%=qa_note%>\n</div>\n<%}%>\n\n<div class="anno_note_section" id="note_section">\n<table>\n</table>\n</div>\n\n\n\n\n\n');
window.JST['qa_reject_dialog'] = _.template('\n<div class="row">\n  <%= _.t(\'reject_point_explanation\') %>\n</div>\n<div class="row tall">\n  <textarea id="qa_point_note" class="text_area dark small content attribute"><%=qa_point_note%></textarea>\n</div>\n\n<% if(is_group){ %>\n<div class="row">\n  <input type="checkbox" id="subitems_too">\n  <%= _.t(\'subitems_too\') %>\n</div>\n<% } %>\n\n\n\n');
window.JST['qc_complete_dialog'] = _.template('\n<div class="row">\n      <%= _.t(\'review_de_instruct\') %>\n</div>\n<div class="radio_row">\n    <%if( !is_supp ){%><%=_.t(\'de_left\')%><%}%>\n    <select id="de_one_review">\n        <option value="1">Poor</option>\n        <option value="2">OK</option>\n        <option value="3" selected="selected">Normal</option>\n        <option value="4">Very Good</option>\n        <option value="5">Fantastic</option>\n    </select>\n</div>\n\n<%if( !is_supp ){%>\n<div class="radio_row">\n    <%=_.t(\'de_right\')%>\n    <select id="de_two_review">\n        <option value="1">Poor</option>\n        <option value="2">OK</option>\n        <option value="3" selected="selected">Normal</option>\n        <option value="4">Very Good</option>\n        <option value="5">Fantastic</option>\n    </select>\n</div>\n<% } %>\n\n<div class="row tall">\n    <%=_.t(\'file_note\')%>:\n    <textarea id="qc_file_note" class="text_area dark small content attribute"></textarea>\n</div>\n\n\n\n\n\n');
window.JST['qc_control_panel'] = _.template('<div id="de1_view" class="qc_editor_view de_review_view"></div>\n<div id="qc_view" class="qc_editor_view"></div>\n<div id="de2_view" class="qc_editor_view de_review_view"></div>\n');
window.JST['qc_de_subpanel'] = _.template('<div class="control_panel_title gradient_light group_navigation"></div>\n\n<div class="header"><%=_.t(\'groups\')%></div>\n<div id="group_section"></div>\n<hr>\n<div class="header"><%=_.t(\'data_points\')%>\n<%if(template_name != null){%>\n(Template: <%=template_name%>)\n<div class="help_url_icon"></div>\n<%}%>\n</div>\n<div id="annotation_section"></div>\n<div><div class="cp_button approve_all"><%=_.t(\'approve_all\')%></div></div>\n\n');
window.JST['qc_reject_dialog'] = _.template('\n<div class="radio_row">\n      <%= _.t(\'reject_de_text\') %>\n</div>\n<div class="radio_row">\n    <input name="de_to_reject" type="radio" value="1"><%=_.t(\'de_left\')%>\n</div>\n<div class="radio_row">\n    <input name="de_to_reject" type="radio" value="2"><%=_.t(\'de_right\')%>\n</div>\n<div class="radio_row">\n    <input name="de_to_reject" type="radio" value="3"><%=_.t(\'reject_de_both\')%>\n</div>\n\n\n\n\n');
window.JST['qc_subpanel'] = _.template('<div class="control_panel_title gradient_light">\n    <div class="button_panel">\n        <div class="cp_button new_group">+ New Group</div>\n        <div class="cp_button save_exit">Save & Exit</div>\n        <div class="cp_button drop_claim">Drop</div>\n        <div class="cp_button reject">Reject</div>\n        <div class="cp_button mark_complete">Complete</div>\n        <div class="cp_button file_note">File Notes</div>\n    </div>\n</div>\n<div class="control_panel_title gradient_light group_navigation"></div>\n\n<div class="header"><%=_.t(\'groups\')%></div>\n<div id="group_section"></div>\n<hr>\n<div class="header"><%=_.t(\'data_points\')%>\n<%if(template_name != null){%>\n(Template: <%=template_name%>)\n<div class="help_url_icon"></div>\n<%}%>\n</div>\n<div id="annotation_section"></div>\n\n');
window.JST['remove_pages'] = _.template('<div class="remove_pages">\n  \n  <div class="editor_toolbar_controls remove_pages_holder">\n    <div class="minibutton remove_pages_confirm_input default not_enabled"></div>\n    <div class="minibutton close_editor"><%= _.t(\'cancel\') %></div>\n  </div>\n  \n  <div class="remove_pages_page_container"></div>\n  \n  <div class="editor_hint"><%= _.t(\'select_pages_remove\') %></div>\n  \n</div>');
window.JST['reorder_pages'] = _.template('<div class="reorder_pages">\n  \n  <div class="editor_toolbar_controls reorder_pages_holder">\n    <div class="minibutton not_enabled reorder_pages_confirm_input default"><%= _.t(\'save_page_order\') %></div>\n    <div class="minibutton close_editor"><%= _.t(\'cancel\') %></div>\n  </div>\n\n  <div class="editor_hint"><%= _.t(\'reorder_hint\') %></div>\n  \n</div>');
window.JST['replace_pages'] = _.template('<div class="replace_pages">\n  \n  <div class="editor_toolbar_controls replace_pages_holder">\n    <form id="new_document_form" action="/import/upload_document" method="POST" enctype="multipart/form-data" target="upload_iframe">\n      <div class="minibutton plus replace_pages_upload_button default" id="new_document"><div class="icon white_plus"></div><div class="center"><%= _.t(\'upload_pages\') %></div></div>\n      <button type="submit"><%= _.t(\'upload_pages\') %></button>\n      <input id="new_document_input" name="file" type="file" multiple />\n      <iframe id="upload_iframe" name="upload_iframe" src="about:blank" class="hidden_iframe"></iframe>\n    </form>\n    <div class="minibutton close_editor"><%= _.t(\'cancel\') %></div>\n  </div>\n  \n  <div class="editor_hint"></div>\n  \n</div>');
window.JST['reviewer_welcome'] = _.template('<%= _.t(\'annotation_help\',fullName ) %>\n <br><br>\n<%= _.t(\'contact_reviewer\',fullName, \'<a href="mailto:\'+ email +\'" class="text_link">\'+ email +\'</a>\',\' <a href="http://www.documentcloud.org" class="text_link">http://www.documentcloud.org</a>\' ) %>\n');
window.JST['section_row'] = _.template('<li class="section_row">\n  <div style="position:relative;">\n    <div class="text_input dark small">\n      <input class="section_title" type="text" placeholder="<%= _.t(\'title\') %>&hellip;" value="" />\n    </div>\n    <div class="text_input dark small">\n      <span class="page_number_mark"><%=_.t(\'pg\') %></span>\n      <input class="page_number" type="text" value="<%= page_number %>" />\n    </div>\n    <div class="icon minus"></div>\n    <div class="icon plus"></div>\n    <br class="clear" />\n  </div>\n</li>');
window.JST['supp_de_control_panel'] = _.template('<div class="control_panel_title gradient_light">\n    <div class="button_panel_multirow">\n        <div class="cp_button new_group">+ New Group</div>\n        <div class="cp_button new_data">+ New Data</div>\n        <div class="cp_button drop_claim">Drop</div>\n    </div>\n    <div class="button_panel_multirow">\n        <div class="cp_button mark_complete">Complete</div>\n        <div class="cp_button file_note">File Note</div>\n        <div class="cp_button save_exit">Save & Exit</div>\n    </div>\n</div>\n<div class="annotation_notice">ANNOTATING</div>\n<div class="control_panel_title gradient_light group_navigation"></div>\n\n<div class="header"><%=_.t(\'groups\')%></div>\n<div id="group_section"></div>\n<hr>\n<div class="header"><%=_.t(\'data_points\')%> <%if(template_name != null){%>(Template: <%=template_name%>)<%}%></div>\n<div id="annotation_section"></div>\n\n');
})();