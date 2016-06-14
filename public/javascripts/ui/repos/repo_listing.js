dc.ui.RepoListing = Backbone.View.extend({
    events: {
        'click #repo_edit'  :   'openEditWindow',
        'click #repo_delete':   'confirmDelete'
    },

    initialize: function() {
        _.bindAll(this, 'openEditWindow', 'confirmDelete', 'deleteRepo');
        this.model.on('sync', this.updateView, this);
        this.model.on('destroy', this.deleteView, this);
    },


    render: function(options) {
        _thisView = this;

        //Render this repo
        _thisView.$el.html(JST['repo/repo_listing']({
            name: dc.inflector.escapeHTML(_thisView.model.get('repo_name'))
        }));

        return _thisView;
    },


    updateView: function(options) {
       this.$('.title.repo').html(this.model.get('name'));
    },


    deleteView: function(options) {
        this.$el.remove();
        this.$el = $();
    },


    //Opens editing window.  Template ID to edit is passed in event data ('repo_id').
    openEditWindow: function(event) {
        dc.ui.RepoDataDialog.open(this.model);
    },


    //Show popup confirming repo delete
    confirmDelete: function(event) {
        dc.ui.Dialog.confirm(_.t('confirm_repo_delete'), this.deleteRepo);
    },


    //Actual delete of repo
    deleteRepo: function(repo) {
        this.model.destroy();
        return true;
    }

})