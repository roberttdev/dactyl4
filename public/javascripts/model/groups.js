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
        this.annotations = new dc.model.Annotations({
            document_id: attributes.document_id,
            group_id: attributes.id
        });
        Backbone.Model.apply(this, arguments);
    },


    //Parse: strip out children and annotation data and pass to those collections
    parse: function(response, options) {
        this.children.reset(response.children);
        delete response.children;
        this.annotations.reset(response.annotations);
        delete response.annotations;
        return response;
    },


    //Clone: create a value-less copy of this group and all subgroups/data points, with passed ID as new parent.
    clone: function(newParentID, success, error) {
        $.ajax({
            url         : this.urlRoot + '/' + this.id + '/clone',
            contentType : 'application/json; charset=utf-8',
            type        : 'post',
            data        : JSON.stringify({'parent_id': newParentID}),
            success     : success,
            error       : error
        })
    },


    //Update Approval:
    update_approval: function(subitems_too, success, error) {
      var _thisModel = this;
      var _thisData = _thisModel.attributes;
      _thisData.subitems_too = subitems_too;
      $.ajax({
          url         : this.urlRoot + '/' + this.id + '/update_approval',
          contentType : 'application/json; charset=utf-8',
          type        : 'post',
          data        : JSON.stringify(_thisData),
          success     : success,
          error       : error
      })
    },


    //Save Graph:  Add/update graph data below this group
    save_graph: function(graph_json, success){
      $.ajax({
        url         : this.urlRoot + '/' + this.id + '/create_graph',
        contentType : 'application/json; charset=utf-8',
        type        : 'post',
        data        : {'graph_json': graph_json},
        success     : success,
        error       : error
      })
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

