//****************
// Template Model
//****************
dc.model.Repository = Backbone.Model.extend({
    urlRoot: '/repositories',


    validate: function(attrs) {
        errors = [];

        //Check for empty repo name
        if( attrs.repo_name == null || attrs.repo_name.length == 0 ){
            this.previous('repo_name')
            errors.push({
                message: _.t('repo_name_required'),
                class: 'repo_name'
            });
        }

        if(errors.length){ return errors; }
    }

});


//*********************
// Repository Collection
//*********************
dc.model.Repositories = Backbone.Collection.extend({
    model : dc.model.Repository,
    url: '/repositories/index.json',
    comparator: 'repo_name'
});
