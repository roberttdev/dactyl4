dc.ui.ViewerBaseControlPanel = Backbone.View.extend({

    _getDocumentModel : function() {
        if (this.docModel) return this.docModel;
        this.docModel = new dc.model.Document(window.currentDocumentModel);
        this.docModel.viewerEditable   = dc.account.get('isOwner');
        this.docModel.suppressNotifier = true;

        return this.docModel;
    }
});