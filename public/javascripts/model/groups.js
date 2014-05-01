//****************
// Group Model
//****************
dc.model.Group = Backbone.Model.extend({
    urlRoot: null,
    children: null,
    annotations: null,

    //Expected parameters: document_id
    constructor: function(attributes, options) {
        attributes = typeof attributes !== 'undefined' ? attributes : {};
        this.urlRoot = '/documents/' + attributes.document_id + '/groups';
        this.children = new dc.model.Groups();
        this.annotations = new dc.model.Annotations();
        Backbone.Model.apply(this, arguments);
    },


    //Parse: strip out children and annotation data and pass to those collections
    parse: function(response, options) {
        this.children.reset(response.children);
        delete response.children;
        this.annotations.reset(response.annotations);
        delete response.annotations;
        return response;
    }
});


//*********************
// Group Collection
//*********************
dc.model.Groups = Backbone.Collection.extend({
    model : dc.model.Group,
    url: null,
    comparator: 'name',

    //Expected parameters: document_id
    constructor: function(attributes, options) {
        attributes = typeof attributes !== 'undefined' ? attributes : {};
        this.url = '/documents/' + attributes.document_id + '/groups';
        Backbone.Collection.apply(this, arguments);
    }
});

