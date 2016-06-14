dc.ui.RepoManager = Backbone.View.extend({
  id: "repo_manager_container",
  className: 'repositories_tab_content',
  repoList: [],
  _newRepo: null,

  initialize: function(options){
    this.options = _.extend(this.options, options);
    this._mainJST = JST['repo/repo_main'];
    _.bindAll(this, 'open', 'render', 'createRepoViews', 'createRepoView', 'createAndRender', 'openCreateWindow', 'addNewRepoToList');
    dc.app.navigation.bind('tab:repositories', this.open);
  },


  render: function() {
    this.$el = $('#' + this.id);
    //Main
    this.$el.html(this._mainJST(this.options));

    //Link event(s)
    this.$('#new_repo').on('click', {}, this.openCreateWindow);

    //Listing rows
    this.$('.centered_list').append(_.map(this.repoList, function(view, cid){
        view.render();
        return view.$el;
    }, this));

    return this.$el;
  },


  open: function() {
    if(!this.repoCollection) {
        //If this is first open request, fetch data, initialize views, and render
        this.repoCollection = new dc.model.Repositories();
        this.repoCollection.fetch({data:{}, success: this.createAndRender, error: this.error});
    }

    dc.app.navigation.open('repositories', true);
    Backbone.history.navigate('repositories');
  },


  createRepoViews: function() {
    this.repoCollection.each(function(repo) {
        this.createRepoView(repo);
    }, this);
  },


  createRepoView: function(model) {
      _repoView = new dc.ui.RepoListing({
          model: model
      }, this);
      this.repoList.push(_repoView);
      _repoView.on('newSubtemplateRequest', this.openSubtemplateWindow);
      return _repoView;
  },


  createAndRender: function() {
      this.createRepoViews();
      this.render();
  },


  openCreateWindow: function() {
      this._newRepo = new dc.model.Repository();
      this._newRepo.once('sync', this.addNewRepoToList, this);
      dc.ui.RepoDataDialog.open(this._newRepo);
  },


  //Add new repo to collection and view, and remove events meant to track creation
  addNewRepoToList: function() {
      this.repoCollection.add(this._newRepo);
      _newRepoView = this.createRepoView(this._newRepo);
      _newRepoView.render();
      this.$('.centered_list').append(_newRepoView.$el);
  },


  error : function(message, leaveOpen) {
    this._information.stop().addClass('error').text(message).show();
    if (!leaveOpen) this._information.delay(3000).fadeOut();
  }
});
