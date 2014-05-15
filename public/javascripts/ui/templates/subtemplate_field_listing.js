dc.ui.SubtemplateFieldListing = Backbone.View.extend({
    selected: false,

    events: {
        'click .field_checkbox': 'handleCheckClick'
    },


    //Initialize: Expects boolean 'selected' to be passed in, to specify whether field is already selected
    initialize: function(args) {
        this.selected = args.selected;

        _.bindAll(this, 'handleCheckClick');
    },


    render: function(options) {
        this.$el.html(JST['template/subtemplate_field_listing']({
            field_name: this.model.get('field_name').replace(/\"/g,'&quot;'),
            field_id  : this.model.get('id')
        }));

        //Set checkbox state
        if( this.selected ){
            this.$('.field_checkbox').attr('checked', 'checked');
        }else{
            this.$('.field_checkbox').removeAttr('checked');
        }

        return this;
    },


    handleCheckClick: function(event) {
        _fieldId = event.target.id.replace('field_', '');
        if( $(event.target).is(':checked') ){ _action = 'add'; } else { _action = 'delete'; }
        this.trigger('fieldClicked', {
            field_id      : _fieldId,
            action        : _action
        });
    }
})