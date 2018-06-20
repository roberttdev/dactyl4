//****************
// Template Model
//****************
dc.model.Highlight = Backbone.Model.extend({
    urlRoot: null,

    //Expected parameters: document_id
    constructor: function(attributes, options) {
        attributes = typeof attributes !== 'undefined' ? attributes : {};
        this.urlRoot = '/documents/' + attributes.document_id + '/highlights';
        Backbone.Model.apply(this, arguments);
    }
});


//*********************
// Highlight Collection
//*********************
dc.model.Highlights = Backbone.BulkSubmitCollection.extend({
    model : dc.model.Highlight,
    url: null,
    comparator: 'title',

    //Expected parameters: document_id
    constructor: function(attributes, options) {
        attributes = typeof attributes !== 'undefined' ? attributes : {};
        this.url = attributes.group_id ? '/documents/' + attributes.document_id + '/groups/' + attributes.group_id + '/highlights' : '/documents/' + attributes.document_id + '/highlights';
        Backbone.Collection.apply(this, arguments);
    },

    //Get all annotations for a document
    getAll: function(options){
        $.ajax({
            url         : this.url + '?all=true',
            contentType : 'application/json; charset=utf-8',
            type        : 'get',
            success     : options['success'],
            error       : options['error']
        })
    }
});

