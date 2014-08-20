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

    //Remove QC approval from point.  Requires 'group_id' passed as an option
    unapprove: function(options) {
        var _thisModel = this;
        $.ajax({
            url         : '/groups/' + options['group_id'] + '/annotations/' + this.id + '/unapprove',
            contentType : 'application/json; charset=utf-8',
            type        : 'put',
            data        : JSON.stringify({'type': options['type']}),
            success     : function(response){
                            _thisModel.set({'approved': response.approved}, {silent: true});
                            options['success'].call();
                          },
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

