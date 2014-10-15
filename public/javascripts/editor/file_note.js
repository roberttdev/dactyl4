dc.ui.FileNoteListing = Backbone.View.extend({

  waitingForClone:  false,
  showEdit:         false,
  showApprove:      false,
  showReject:       false,
  showNote:         false,
  tagName:          'tr',

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

    if(this.model.get('approved')){ this.showReject(); }else{ this.showApprove(); }
    return this;
  },


  showApprove : function() {
      this.$('.reject_item').hide();
      this.$('.row_status').removeClass('complete');
      this.$('.row_status').addClass('incomplete');
      this.$('.approve_item').show().css('display', 'inline-block');
  },


  showReject : function() {
      this.$('.approve_item').hide();
      this.$('.row_status').removeClass('incomplete');
      this.$('.row_status').addClass('complete');
      this.$('.reject_item').show().css('display', 'inline-block');
  }

});
