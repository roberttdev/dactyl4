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
    }
});


//*********************
// Template Collection
//*********************
dc.model.Annotations = Backbone.Collection.extend({
    model : dc.model.Annotation,
    url: null,
    comparator: 'title',

    //Expected parameters: document_id
    constructor: function(attributes, options) {
        attributes = typeof attributes !== 'undefined' ? attributes : {};
        this.url = '/documents/' + attributes.document_id + '/annotations';
        Backbone.Collection.apply(this, arguments);
    }
});

