dc.ui.QCAnnotationListing = dc.ui.BaseAnnotationListing.extend({

    render : function() {
        dc.ui.BaseAnnotationListing.prototype.render.apply(this, arguments);

        this.$('.clone_item').hide();
        this.$('.row_status').removeClass('incomplete');

        if( this.model.get('iteration') != currentDocumentModel.iteration ){
            this.$('.delete_item').hide();
        }

        return this;
    },


    //Delete override; removes from QC instead
    deletePoint: function() {
        var _thisAnno = this;

        var success = function(response){
            _thisAnno.trigger('removeFromQC', _thisAnno, response.group_id);
            $(_thisAnno.el).remove();
        };

        this.model.destroy({success: success});

        return true;
    },


    //prepareForAnnotation: trigger display of based on anno
    prepareForAnnotation : function() {
        dc.app.editor.annotationEditor.showHighlight({highlight_id: this.model.get('highlight_id'), annotation_id: this.model.get('based_on')}, false, true);
        this.trigger('annotationSelected', this.model);
    },
});
