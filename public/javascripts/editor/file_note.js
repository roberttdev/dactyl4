dc.ui.FileNoteListing = Backbone.View.extend({

  waitingForClone:  false,
  showEdit:         false,
  showApprove:      false,
  showReject:       false,
  showNote:         false,

  events : {
  },

  initialize : function(options) {
    _.bindAll(this, 'render');

    this._mainJST = JST['file_note'];
  },


  render : function() {
    _thisView           = this;
    $(this.el).html(this._mainJST({
        title:          this.model.get('note')
    }));

    return this;
  }

});
