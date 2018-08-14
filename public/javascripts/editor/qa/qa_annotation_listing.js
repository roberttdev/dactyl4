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
      this.$('.row_status').removeClass('rejected');
      this.$('.row_status').addClass('complete');
      this.$('.reject_item').show().css('display', 'inline-block');
    },


    //setReject: Sets UI to rejected
    setReject: function(){
        this.$('.reject_item').hide();
        this.$('.row_status').removeClass('incomplete');
        this.$('.row_status').removeClass('complete');
        this.$('.row_status').addClass('rejected');
        this.$('.approve_item').show().css('display', 'inline-block');
        this.$('.point_note').show().css('display', 'inline-block');
    },


    handleApprove: function(){
        var _thisView = this;
        this.model.set({approved: true, qa_reject_note: null});
        this.setApprove(false);
        this.model.update_qa_approval(
            function(){
                if(!_thisView.model.get('is_graph_data')){ _thisView.trigger('qaAddress', _thisView); }
            },
            function(){
                alert('Error: Approval failed!')
            }
        );
    },


    handleReject: function(){
        var _thisView = this;
        dc.ui.QARejectDialog.open(_thisView.model, false, function(){
            _thisView.setReject();
            if(!_thisView.model.get('is_graph_data')){ _thisView.trigger('qaAddress', _thisView); }
        });
    },


    handleEditNote: function(){
        var _thisView = this;
        dc.ui.QARejectDialog.open(_thisView.model, function(){});
    }
});
