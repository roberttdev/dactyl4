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

    //Mark note as addressed or not
    address: function(addressed, options) {
        var _thisModel = this;
        $.ajax({
            url         : this.urlRoot + '/' + this.id,
            contentType : 'application/json; charset=utf-8',
            type        : 'put',
            data        : JSON.stringify({'addressed': addressed}),
            success     : options['success'],
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

