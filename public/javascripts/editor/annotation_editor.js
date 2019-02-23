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
        //Holds initialized draw parameters when drawing
        this.drawParams = {};

        // cache references to elements
        this._buttons['public'] = $('#control_panel .public_annotation');
        this.pages          = $('.DV-pages');
        this.page           = $('.DV-page');
        this._guide         = $('#public_note_guide');

        _.bindAll(this, 'open', 'close', 'drawHighlight', 'saveHighlight', 'passCancelNotification',
            'passCloneConfirm','deleteHighlight', 'selectHighlightPoint');
        currentDocument.api.onHighlightSave(this.saveHighlight);
        currentDocument.api.onHighlightSelect(this.selectHighlightPoint);
        currentDocument.api.onHighlightCancel(this.passCancelNotification);
        currentDocument.api.onCloneConfirm(this.passCloneConfirm);
        this._inserts.click(this.createPageNote);
    },


    open : function(highlight, groupId, showEdit, success, highlight_type) {
        //Request to hide existing annos; if succeeds, continue and call success function
        var _me = this;

        //Don't allow if not in default zoom
        if( currentDocument.api.relativeZoom() != 1 ){
            alert('Highlighting is only allowed at the default zoom level.');
        }else{
            this.hideActiveHighlights(function(){
                //If highlight already has location, just show it
                if( highlight.get('highlight_id') ){
                    success.call();
                    var highlightInfo = {highlight_id: highlight.get('highlight_id')};
                    (highlight_type == 'graph') ? highlightInfo['graph_id'] = highlight.get('id') : highlightInfo['anno_id'] = highlight.get('id');
                    return _me.showHighlight(highlightInfo, showEdit, false);
                }

                if (highlight != null) { _me._active_highlight = highlight; }

                _me._open = true;
                _me.redactions = [];
                _me._highlight_type = highlight_type == 'graph' ? 'graph' : 'annotation';
                _me.page.css({cursor: 'crosshair'});
                _me._inserts.filter('.visible').show().addClass('DV-public');

                // Start drawing region when user mousedown
                _me.page.unbind('mousedown', _me.drawHighlight);
                _me.page.bind('mousedown', _me.drawHighlight);
                $(document).unbind('keydown', _me.handleCloseRequest);
                $(document).bind('keydown', _me.handleCloseRequest);

                //Show notification that highlight mode is on
                $('.highlight_notice').show();

                $(document.body).setMode('public', 'editing');
                _me._buttons['public'].addClass('open');
                _me._guide.fadeIn('fast');
                success.call();
            });
        }
    },


    close : function(success) {
        var _me = this;
        this._open = false;
        this._active_highlight = null;
        this._highlight_type = null;
        this.hideActiveHighlights(function(){
            $('.highlight_notice').hide();
            _me.page.css({cursor : ''});
            _me.stopSelectionEvents();
            _me.clearHighlight();
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


    clearHighlight : function() {
        if (this.region) $(this.region).remove();
    },


    drawHighlight : function(e) {
        _highlight = this._active_highlight;
        e.stopPropagation();
        e.preventDefault();
        this._activePage = $(e.currentTarget);
        // not sure why this isn't just currentDocument.api.getPageNumber
        this._activePageNumber = currentDocument.api.getPageNumberForId($(this._activePage).closest('.DV-set').attr('data-id'));
        this.clearHighlight(); // close any open highlight.

        // Record the page boundaries and the starting position for the click+drag
        this.drawParams['offTop']        = this._activePage.offset().top,
        this.drawParams['offLeft']       = this._activePage.offset().left,
        this.drawParams['xStart']        = e.pageX - this.drawParams['offLeft'],
        this.drawParams['yStart']        = e.pageY - this.drawParams['offTop'],
        this.drawParams['borderBottom']  = this._activePage.height() - 6,
        this.drawParams['borderRight']   = this._activePage.width() - 6;

        // Create a div to represent the highlighted region
        this.region = this.make('div', {'class' : 'DV-highlightRegion active ' + this._accessClass(this._kind), style:'position:absolute;'});
        (this._kind == 'redact' ? this._specificPage() : this._activePage).append(this.region);

        // set the highlighted region's boundaries
        $(this.region).css(this.drawHighlight_coords(e));
        // and continue to update the region's boundaries when the mouse moves.
        this.pages.on('mousemove', _.bind(this.drawHighlight_drag, this));
        // when drag is finished..
        this.pages.bind('mouseup', _.bind(this.drawHighlight_dragEnd, this));
    },


    //Function for drag part of drawing highlight
    drawHighlight_drag: function(e) {
        $(this.region).css(this.drawHighlight_coords(e));
        return false;
    },


    //Function for end drag part of drawing highlight
    drawHighlight_dragEnd: function(e) {
        // calculate highlighted region's dimensions
        var loc = this.drawHighlight_coords(e);

        this.stopSelectionEvents();

        loc.left -= 1;
        loc.top -= 1;
        loc.right = loc.left + loc.width;
        loc.bottom = loc.top + loc.height;
        if (this._kind != 'redact') {
            loc.top += 2;
            loc.left += 5;
            loc.right += 15;
            loc.bottom += 5;
        }

        // Use the document's current zoom level to scale the region
        // into normalized coordinates
        var zoom = currentDocument.api.relativeZoom();
        var location = _.map([loc.top, loc.right, loc.bottom, loc.left], function (l) {
            return Math.round(l / zoom);
        }).join(',');

        // Instruct the viewer to create a note, if the region is large enough.
        if (loc.width > 5 && loc.height > 5) {
            var highlight_type = this._highlight_type;

            // Close the editor
            this.close();

            var highlightInfo = {
                access: 'public',
                document_id: _highlight.get('document_id'),
                location: location,
                page: this._activePageNumber,
                unsaved: true
            }

            if (highlight_type == 'graph') {
                highlightInfo['graphs'] = [{
                    document_id: _highlight.get('document_id'),
                    graph_json: _highlight.get('graph_json'),
                    group_id: _highlight.get('group_id'),
                    owns_note: true
                }];
            } else {
                highlightInfo['annotations'] = [{
                    content: _highlight.get('content'),
                    document_id: _highlight.get('document_id'),
                    group_id: _highlight.get('group_id'),
                    id: _highlight.id,
                    owns_note: true,
                    title: _highlight.get('title')
                }];
            }

            currentDocument.api.addHighlight(highlightInfo);
            this.clearHighlight();
        }

        return false;
    },


    //Function for coordinate generation while drawing highlight
    drawHighlight_coords: function(e) {
        var x = e.pageX - this.drawParams['offLeft'] - 3,
            y = e.pageY - this.drawParams['offTop'] - 3;
        // keep ending position for drag in bounds
        x = x < 0 ? 0 : (x > this.drawParams['borderRight'] ? this.drawParams['borderRight'] : x);
        y = y < 0 ? 0 : (y > this.drawParams['borderBottom'] ? this.drawParams['borderBottom'] : y);
        return {
            left    : Math.min(this.drawParams['xStart'], x),
            top     : Math.min(this.drawParams['yStart'], y),
            width   : Math.abs(x - this.drawParams['xStart']),
            height  : Math.abs(y - this.drawParams['yStart'])
        };
    },


    //Stop drawing process
    stopSelectionEvents: function() {
        $(document).unbind('keydown', this.handleCloseRequest);
        this.pages.unbind('mouseup', this.drawHighlight_dragEnd).unbind('mousemove', this.drawHighlight_drag);
        this.page.unbind('mousedown', this.drawHighlight);
        this.drawParams = {};
    },


    // Cause matching highlight in viewer to be selected
    showHighlight: function(highlightInfo, showEdit, callbacks) {
        currentDocument.api.selectHighlight(highlightInfo, showEdit, callbacks ? callbacks : false);
    },


    saveHighlight : function(saveContent) {
        if(saveContent.type == 'graph'){
            this.saveGraph(saveContent.content);
        }else {
            this[saveContent.content.unsaved ? 'createAnnotation' : 'updateAnnotation'](saveContent.content);
        }
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
        this.trigger('saveGraph', params);
    },


    updateAnnotation : function(params) {
        this.trigger('updateAnnotation', params);
    },


    deleteHighlight : function(anno_id, highl_id) {
        currentDocument.api.deleteHighlight({
            anno_id: anno_id,
            highlight_id: highl_id
        });
    },


    // Fire event indicating which highlight content was selected so DC-side can sync
    selectHighlightPoint: function(highl_content) {
        if( this._open ){
            //If mid-point-creation, selection means the highlight should be overloaded.  Turn off point-highlighting and do so
            this._open = false;
            this.stopSelectionEvents();
            var newContent = {};
            if( this._highlight_type == 'annotation' ){
                newContent = {
                    type: 'annotation',
                    document_id: this._active_highlight.get('document_id'),
                    group_id: this._active_highlight.get('group_id'),
                    id: this._active_highlight.get('id'),
                    text: this._active_highlight.get('content'),
                    title: this._active_highlight.get('title')
                }
            }else if( this._highlight_type == 'graph' ){
                newContent = {
                    type: 'graph',
                    document_id: this._active_highlight.get('document_id'),
                    group_id: this._active_highlight.get('id')
                }
            }
            this.addContentToHighlight(highl_content.content.highlight_id, newContent, true);
        }else{
            //If not during point creation, fire selection event and tell DV to show
            if( highl_content.type == 'annotation' ){ this.trigger('annotationSelected', highl_content.content); }
            else if( highl_content.type == 'graph' ){ this.trigger('graphSelected', highl_content.content); }
            currentDocument.api.selectHighlight(highl_content.content);
        }
    },


    //Send new content to DV to add to a highlight
    //Supported so far: type, id, document_id, group_id, title, content
    addContentToHighlight: function(highlight_id, newContent, showEdit){
        currentDocument.api.addContentToHighlight(highlight_id, newContent, showEdit);
    },


    //Hide any existing active highlights
    hideActiveHighlights: function(success) {
        currentDocument.api.cleanUp(success);
    },


    //Pass highlight data to DV so it can update any missing info from DC interaction
    syncDV: function(highlightInfo) {
        currentDocument.api.syncHighlights(highlightInfo);
    },


    //Reload DV highlight list after a major change
    reloadHighlights: function(annos) {
        currentDocument.api.reloadHighlights(annos);
    },


    //Ask DV to show/hide clone confirmation buttons on its current highlight
    requestCloneConfirm: function(setTo) {
        currentDocument.api.requestCloneConfirm(setTo);
    },


    //Passes notification that cancel has fired in DV
    passCancelNotification: function() {
        this.trigger('highlightCancelled');
    },


    //Passes notification that clone was confirmed in DV
    passCloneConfirm: function(contentToClone) {
        this.trigger('cloneConfirmed', contentToClone.content);
    },

    //Temporarily update view to mark highlight's state of approval
    markApproval: function(highlight_id, content_id, content_type, approved) {
        var updateHash = {
            type: content_type,
            content: {
                highlight_id: highlight_id,
                id: content_id,
                approved: approved
            }
        }
        this.syncDV(updateHash);
    },


    //Populate DV's autocomplete recommendations
    setRecommendations: function(recArray) {
        currentDocument.api.setRecommendations(recArray);
    },


    //Catch event and close
    handleCloseRequest: function(e) {
        this.close();
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
