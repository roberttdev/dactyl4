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
        this.model.unapprove({
            group_id:   this.group_id,
            success:    function(response){
                    _thisAnno.trigger('removeFromQC', _thisAnno, response.group_id);
                    $(_thisAnno.el).remove();
            }
        });
        return true;
    }

});
