dc.ui.AnnotationEditor = Backbone.View.extend({

  id : 'annotation_editor',

  events : {
    'click .close': 'close'
  },

  initialize: function(options) {
    this._kind = 'public';
    // track open/close state
    this._open    = false;
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

  open : function(annotation, groupId, showEdit) {
    //If annotation already has location, just show it
    if( annotation.get('location') ){ return this.showAnnotation(annotation, showEdit); }

    if( annotation != null ){
        annotation.groups = [groupId];
        this._active_annotation = annotation;
    }

    this.hideActiveAnnotations();

    this._open = true;
    this.redactions = [];
    this.page.css({cursor: 'crosshair'});
    this._inserts.filter('.visible').show().addClass('DV-public');

    // Start drawing region when user mousesdown
    this.page.bind('mousedown', this.drawAnnotation);
    $(document).bind('keydown', this.close);

    $(document.body).setMode('public', 'editing');
    this._buttons['public'].addClass('open');
    this._guide.fadeIn('fast');
  },

  close : function() {
    this._open = false;
    this._active_annotation = null;
    this.page.css({cursor : ''});
    this.page.unbind('mousedown', this.drawAnnotation);
    $(document).unbind('keydown', this.close);
    this.clearAnnotation();
    this.clearRedactions();
    this.hideActiveAnnotations();
    this._inserts.hide().removeClass('DV-public DV-private');
    $(document.body).setMode(null, 'editing');
    this._buttons['public'].removeClass('open');
    this._guide.hide();
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
        // Close the editor
        this.close();
        // Instruct the viewer to create a note, if the region is large enough.
        if (loc.width > 5 && loc.height > 5) {
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
      }
      return false;
    }, this);
    this.pages.bind('mouseup', dragEnd);
  },

  // Cause matching annotation in viewer to be selected
  showAnnotation: function(anno, showEdit) {
      currentDocument.api.selectAnnotation({
          id        : anno.id,
          location  : anno.get('location')
      },
      showEdit);
  },

  saveAnnotation : function(anno) {
    this[anno.unsaved ? 'createAnnotation' : 'updateAnnotation'](anno);
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
      group_id    : anno.groupCount > 0 ? anno.groups[anno.groupIndex - 1].group_id : undefined,
      location    : anno.location,
      account_id  : anno.account_id
    };
    return _.extend(params, extra || {});
  },

  createAnnotation : function(anno) {
    var params = this.annotationToParams(anno);
    $.ajax({url : this._baseURL, type : 'POST', data : params, dataType : 'json', success : _.bind(function(resp) {
      anno.server_id = resp.id;
      this._adjustNoteCount(1, this._kind == 'public' ? 1 : 0);
    }, this)});
  },

  updateAnnotation : function(anno) {
    var params  = this.annotationToParams(anno);
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
  hideActiveAnnotations: function() {
      currentDocument.api.cleanUp();
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
