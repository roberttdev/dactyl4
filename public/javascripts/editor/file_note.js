dc.ui.FileNoteListing = Backbone.View.extend({

  waitingForClone:  false,
  showEdit:         false,
  showApprove:      false,
  showReject:       false,
  showNote:         false,
  tagName:          'tr',

  events : {
    'click .note_text'    : 'requestPointReload',
    'click .approve_item' : 'approveNote',
    'click .reject_item'  : 'disapproveNote'
  },

  initialize : function(options) {
    _.bindAll(this, 'render');

    this._mainJST = JST['file_note'];
  },


  render : function(showApproval) {
    _thisView = this;
    var noteText = this.model.get('annotation_id') ? '[POINT] ' : '[GROUP] '
    $(this.el).html(this._mainJST({
      title:          noteText + this.model.get('note'),
      show_approval:  showApproval
    }));

    if(this.model.get('addressed')){ this.showReject(); }else{ this.showApprove(); }
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
  },


  //Send request to redirect to the AnnotationGroup this note refers to
  requestPointReload : function() {
    var payload = {
      group_id: this.model.get('group_id'),
      annotation_id: this.model.get('annotation_id')
    }
    this.trigger('requestPointReload', payload);
  },


  approveNote : function() {
    this.showReject();
    this.model.address(true);
  },

  disapproveNote: function() {
    this.showApprove();
    this.model.address(false);
  }

});
