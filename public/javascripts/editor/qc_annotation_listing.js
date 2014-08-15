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
        this.model.removeFromQC({
            group_id: this.group_id,
            success: function(){
                _thisAnno.trigger('removeFromQC', this.model);
                $(_thisAnno.el).remove();
            }
        });
        return true;
    }

});
