//****************
// Template Model
//****************
dc.model.Annotation = Backbone.Model.extend({
    urlRoot: null,

    //Expected parameters: document_id
    constructor: function(attributes, options) {
        attributes = typeof attributes !== 'undefined' ? attributes : {};
        this.urlRoot = '/documents/' + attributes.document_id + '/annotations';
        Backbone.Model.apply(this, arguments);
    },

    //Remove QC approval from point.
    removeFromQC: function(options) {
        $.ajax({
            url         : '/annotations/' + this.id + '/un_qc?group_id=' + options['group_id'],
            contentType : 'application/json; charset=utf-8',
            type        : 'put',
            success     : options['success'],
            error       : options['error']
        })
    }
});


//*********************
// Annotation Collection
//*********************
dc.model.Annotations = Backbone.BulkSubmitCollection.extend({
    model : dc.model.Annotation,
    url: null,
    comparator: 'title',

    //Expected parameters: document_id
    constructor: function(attributes, options) {
        attributes = typeof attributes !== 'undefined' ? attributes : {};
        this.url = attributes.group_id ? '/documents/' + attributes.document_id + '/groups/' + attributes.group_id + '/annotations' : '/documents/' + attributes.document_id + '/annotations';
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

