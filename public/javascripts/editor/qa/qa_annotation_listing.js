dc.ui.QAAnnotationListing = dc.ui.BaseAnnotationListing.extend({

    showApprove: true,
    showReject:  true,

    initialize: function() {
      dc.ui.BaseAnnotationListing.prototype.initialize.apply(this, arguments);

      this.events['click .approve_item'] = 'handleApprove';
      this.events['click .reject_item'] = 'handleReject';
      this.events['click .point_note'] = 'handleEditNote';
    },

    render : function() {
        dc.ui.BaseAnnotationListing.prototype.render.apply(this, arguments);

        this.$('.clone_item').hide();
        this.$('.delete_item').hide();

        if( this.model.get('approved') ) { this.setApprove(); }
        if( this.model.get('qa_reject_note') != null ){ this.setReject(); }

        return this;
    },


    //setApprove: Sets UI to approved
    setApprove: function(){
        this.$('.approve_item').hide();
        this.$('.point_note').hide();
        this.$('.row_status').removeClass('incomplete');
        this.$('.row_status').addClass('complete');
        this.$('.reject_item').show().css('display', 'inline-block');
    },


    //setReject: Sets UI to rejected
    setReject: function(){
        this.$('.reject_item').hide();
        this.$('.row_status').removeClass('incomplete');
        this.$('.row_status').addClass('complete');
        this.$('.approve_item').show().css('display', 'inline-block');
        this.$('.point_note').show().css('display', 'inline-block');
    },


    handleApprove: function(){
        this.model.set({approved: true, qa_reject_note: null});
        this.setApprove(false);
        this.trigger('qaAddress', this);
    },


    handleReject: function(){
        var _thisView = this;
        dc.ui.QARejectDialog.open(_thisView.model, function(){
            _thisView.setReject();
            _thisView.trigger('qaAddress', _thisView);
        });
    },


    handleEditNote: function(){
        var _thisView = this;
        dc.ui.QARejectDialog.open(_thisView.model, function(){});
    }
});
