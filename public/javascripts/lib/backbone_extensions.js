(function(){

  // Makes the view enter a mode. Modes have both a 'mode' and a 'group',
  // and are mutually exclusive with any other modes in the same group.
  // Setting will update the view's modes hash, as well as set an HTML class
  // of *[mode]_[group]* on the view's element. Convenient way to swap styles
  // and behavior.
  Backbone.View.prototype.setMode = function(mode, group) {
    this.modes || (this.modes = {});
    if (this.modes[group] === mode) return;
    $(this.el).setMode(mode, group);
    this.modes[group] = mode;
  };
  
  // For small amounts of DOM Elements, where a full-blown template isn't
  // needed, use **make** to manufacture elements, one at a time.
  //
  //     var el = this.make('li', {'class': 'row'}, this.model.escape('title'));
  //
  Backbone.View.prototype.make = function(tagName, attributes, content) {
    var el = document.createElement(tagName);
    if (attributes) Backbone.$(el).attr(attributes);
    if (content != null) Backbone.$(el).html(content);
    return el;
  };

  // Treat empty strings as `null`, in the context of Backbone Models.
  var oldSet = Backbone.Model.prototype.set;
  Backbone.Model.prototype.set = function(attrs, options) {
    var copy = {};
    if (attrs) {
      for (var attr in attrs) {
        copy[attr] = (attrs[attr] !== '' ? attrs[attr] : null);
      }
    }
    return oldSet.call(this, copy, options);
  };

})();


// BulkSubmitCollection: An extension of Collection that easily allows groups of models
//          to be sent to the server as one request.
Backbone.BulkSubmitCollection = Backbone.Collection.extend({

    //Pushes all models to the collection's base URL in one request.
    //Options:
    //'success' : success function
    //'error'   : error function
    pushAll: function(options){
        _thisColl = this;

        _hasChanged = _.find(this.models, function(model){ return model.isNew() || model.changedAttributes(); });

        if( _hasChanged ) {
            _bulkJSON = {bulkData: this.toJSON()};
            $.ajax({
                url: this.url,
                contentType: 'application/json; charset=utf-8',
                type: 'put',
                data: JSON.stringify(_bulkJSON),
                success: function (responseData) {
                    _thisColl.parseBulkResponse(responseData, options['success']);
                },
                error: options['error']
            });
        } else {
            options['success'].call();
        }
    },


    //Parses bulk response to update collection (currently just does a full replace)
    parseBulkResponse: function(responseData, success) {
        this.reset(responseData);
        success.call();
    }
});