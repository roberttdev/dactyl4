dc.ui.TemplateListing = Backbone.View.extend({
    events: {
        'click #new_subtemplate':   'openSubtemplateWindow',
        'click #template_edit'  :   'openEditWindow',
        'click #template_delete':   'confirmDelete'
    },

    initialize: function() {
        _.bindAll(this, 'openEditWindow', 'confirmDelete', 'deleteTemplate', 'addNewSubtemplate', 'openSubtemplateWindow');
        this.model.on('sync', this.updateView, this);
        this.model.on('destroy', this.deleteView, this);
    },


    render: function(options) {
        _thisView = this;

        //Render this template
        _thisView.$el.html(JST['template/template_listing']({
            name: _thisView.model.get('name')
        }));

        //Render subtemplates
        $.each(_thisView.model.subtemplates.models, function(index, subtemplate){
           _thisView.showSubtemplate(subtemplate);
        });
        return _thisView;
    },


    showSubtemplate: function(model) {
        _subView = new dc.ui.SubtemplateListing({model: model, parentTemplate: this.model});
        _subView.render();
        this.$('.subtemplate_container').append(_subView.$el);
    },


    updateView: function(options) {
       this.$('.title.template').html(this.model.get('name'));
    },


    deleteView: function(options) {
        this.$el.remove();
        this.$el = $();
    },


    //Opens editing window.  Template ID to edit is passed in event data ('template_id').
    openEditWindow: function(event) {
        dc.ui.TemplateDataDialog.open(this.model);
    },


    //Show popup confirming template delete
    confirmDelete: function(event) {
        dc.ui.Dialog.confirm('Are you sure you want to delete this template?', this.deleteTemplate);
    },


    //Actual delete of template
    deleteTemplate: function(template) {
        this.model.destroy();
        return true;
    },


    //Add new subtemplate to view
    addNewSubtemplate: function() {
        this.model.subtemplates.add(this._newSubtemplate);
        this.showSubtemplate(this._newSubtemplate);

    },


    openSubtemplateWindow:  function(template_id) {
        this._newSubtemplate = new dc.model.Subtemplate({template_id: this.model.id});
        this._newSubtemplate.once('sync', this.addNewSubtemplate, this);
        dc.ui.SubtemplateDataDialog.open(this._newSubtemplate, this.model);
    }
})