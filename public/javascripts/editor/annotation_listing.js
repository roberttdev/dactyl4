dc.ui.AnnotationListing = Backbone.View.extend({

  events : {
  },

  initialize : function() {
    _.bindAll(this, 'render');

    this._mainJST = JST['annotation_listing'];
  },


  render : function() {
    _thisView           = this;
    $(this.el).html(this._mainJST({
        annotation_id:     this.model.id
    }));

    //Populate title; string if 'templated', text input if not
    if( this.model.get('templated') ){
        _titleHTML = this.model.get('title');
    } else {
        _titleHTML = '<input id="annot-title-' + this.model.id + '" type="text" value="' + this.model.get('title') +'"/>';
    }
    this.$('.annotation_name').html(_titleHTML);

    //Populate value
      _valueHTML = '<input id="annot-content-' + this.model.id + '" type="text" value="' + $.trim(this.model.get('content')) +'"/>';
    this.$('.annotation_value').html(_valueHTML);

    return this;
  }

});
