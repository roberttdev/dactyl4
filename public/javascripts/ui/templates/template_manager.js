dc.ui.TemplateManager = Backbone.View.extend({
  id: "template_manager_container",
  className: 'templates_tab_content',
  templateList: [],
  _newTemplate: null,

  initialize: function(options){
    this.options = _.extend(this.options, options);
    this._mainJST = JST['template/template_main'];
    _.bindAll(this, 'open', 'render', 'createTemplateViews', 'createTemplateView', 'createAndRender', 'openCreateWindow', 'addNewTemplateToList');
    dc.app.navigation.bind('tab:templates', this.open);
  },


  render: function() {
    this.$el = $('#' + this.id);
    //Main
    this.$el.html(this._mainJST(this.options));

    //Link event(s)
    this.$('#new_template').on('click', {}, this.openCreateWindow);

    //Listing rows
    this.$('.centered_list').append(_.map(this.templateList, function(view, cid){
        view.render();
        return view.$el;
    }, this));

    return this.$el;
  },


  open: function() {
    if(!this.templateCollection) {
        //If this is first open request, fetch data, initialize views, and render
        this.templateCollection = new dc.model.Templates();
        this.templateCollection.fetch({data:{subtemplates: true}, success: this.createAndRender, error: this.error});
    }

    dc.app.navigation.open('templates', true);
    Backbone.history.navigate('templates');
  },


  createTemplateViews: function() {
    this.templateCollection.each(function(template) {
        this.createTemplateView(template);
    }, this);
  },


  createTemplateView: function(model) {
      _templateView = new dc.ui.TemplateListing({
          model: model
      }, this);
      this.templateList.push(_templateView);
      _templateView.on('newSubtemplateRequest', this.openSubtemplateWindow);
      return _templateView;
  },


  createAndRender: function() {
      this.createTemplateViews();
      this.render();
  },


  openCreateWindow: function() {
      this._newTemplate = new dc.model.Template();
      this._newTemplate.once('sync', this.addNewTemplateToList, this);
      dc.ui.TemplateDataDialog.open(this._newTemplate);
  },


  //Add new template to collection and view, and remove events meant to track creation
  addNewTemplateToList: function() {
      this.templateCollection.add(this._newTemplate);
      _newTemplateView = this.createTemplateView(this._newTemplate);
      _newTemplateView.render();
      this.$('.template_list').append(_newTemplateView.$el);
  },


  error : function(message, leaveOpen) {
    this._information.stop().addClass('error').text(message).show();
    if (!leaveOpen) this._information.delay(3000).fadeOut();
  }
});
