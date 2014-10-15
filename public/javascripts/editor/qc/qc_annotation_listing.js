dc.ui.QCAnnotationListing = dc.ui.BaseAnnotationListing.extend({

    render : function() {
        dc.ui.BaseAnnotationListing.prototype.render.apply(this, arguments);

        this.$('.clone_item').hide();
        this.$('.row_status').removeClass('incomplete');

        return this;
    },


    //Delete override; removes from QC instead
    deletePoint: function() {
        var _thisAnno = this;

        var success = function(response){
            _thisAnno.trigger('removeFromQC', _thisAnno, response.group_id);
            $(_thisAnno.el).remove();
        };

        if( this.model.changedAttributes() ) {
            //If not changed, then never saved.. just wipe from front end
            success({group_id: this.model.get('based_on_group_id')});
        }else{
            this.model.unapprove({
                group_id: this.group_id,
                success: success
            });
        }
        return true;
    }

});
