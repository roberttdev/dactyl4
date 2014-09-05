dc.ui.QAAnnotationListing = dc.ui.BaseAnnotationListing.extend({

    showApprove: true,
    showReject:  true,

    events : {
        'click .approve_item'  : 'handleApprove',
        'click .reject_item'   : 'handleReject'
    },

    render : function() {
        dc.ui.BaseAnnotationListing.prototype.render.apply(this, arguments);

        this.$('.clone_item').hide();
        this.$('.delete_item').hide();

        if( this.model.get('approved') ) { this.setApprove(true); }
        if( this.model.get('qa_note') != null ){ this.setReject(true); }

        return this;
    },


    //setApprove: Sets model & UI to approved. Can skip updating model with parameter.
    setApprove: function(skipModelUpdate){
        if(!skipModelUpdate) {
            this.model.set({approved: true, qa_note: null});
            dc.app.editor.annotationEditor.markApproval(this.model.id, true);
        }

        this.$('.approve_item').hide();
        this.$('.row_status').removeClass('incomplete');
        this.$('.row_status').addClass('complete');
        this.$('.reject_item').show().css('display', 'inline-block');
    },


    handleApprove: function(){
        this.setApprove(false);
    },


    //setReject: Sets model & UI to rejected. Can skip updating model with parameter (which skips popup)
    setReject: function(skipModelUpdate){
        if(!skipModelUpdate){
            dc.app.editor.annotationEditor.markApproval(this.model.id, false);
        }

        this.$('.reject_item').hide();
        this.$('.row_status').removeClass('incomplete');
        this.$('.row_status').addClass('complete');
        this.$('.approve_item').show().css('display', 'inline-block');
    },


    handleReject: function(){
        this.setReject(false);
    }
});
