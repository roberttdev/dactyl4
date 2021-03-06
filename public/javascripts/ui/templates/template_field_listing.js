dc.ui.TemplateFieldListing = Backbone.View.extend({
    events: {
        'click .delete_template':    'deleteField'
    },

    initialize: function() {
        _.bindAll(this, 'deleteField');
        this.model.on('destroy', this.deleteView, this);
    },

    render: function(options) {
        this.$el.html(JST['template/template_field_listing']({
            field_name: this.model.get('field_name') ? this.model.get('field_name').replace(/\"/g,'&quot;') : ''
        }));
        return this;
    },


    deleteView: function(options) {
        this.remove();
        this.$el = $();
    },


    //Actual delete of template
    deleteField: function(template) {
        this.model.destroy();
        this.trigger('destroy', this);
        return true;
    }
})