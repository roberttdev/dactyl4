//****************
// Template Model
//****************
dc.model.FileNote = Backbone.Model.extend({
    urlRoot: null,

    //Expected parameters: document_id
    constructor: function(attributes, options) {
        attributes = typeof attributes !== 'undefined' ? attributes : {};
        this.urlRoot = '/documents/' + attributes.document_id + '/file_notes';
        Backbone.Model.apply(this, arguments);
    },

    //Remove QC approval from point.  Requires 'group_id' passed as an option
    address: function(options) {
        var _thisModel = this;
        $.ajax({
            url         : this.urlRoot + '/' + this.id,
            contentType : 'application/json; charset=utf-8',
            type        : 'put',
            data        : JSON.stringify({'type': options['type']}),
            success     : function(response){
                            _thisModel.set({'addressed': response.addressed}, {silent: true});
                            if(options['success']){ options['success'](response); }
                          },
            error       : options['error']
        })
    }
});


//*********************
// Annotation Collection
//*********************
dc.model.FileNotes = Backbone.BulkSubmitCollection.extend({
    model : dc.model.FileNote,
    url: null,

    //Expected parameters: document_id
    constructor: function(attributes, options) {
        attributes = typeof attributes !== 'undefined' ? attributes : {};
        this.url = '/documents/' + attributes.document_id + '/file_notes';
        Backbone.Collection.apply(this, arguments);
    }
});

