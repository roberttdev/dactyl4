dc.ui.RepoDataDialog = dc.ui.Dialog.extend({

  id                : 'edit_repo_dialog',
  className         : 'dialog tempalog',
  repo          : null,

  dataEvents : {
      'click .cancel'     : 'close',
      'click .ok'         : 'saveAndClose',
      'focus input'       : '_addFocus',
      'focus textarea'    : '_addFocus',
      'blur input'        : '_removeFocus',
      'blur textarea'     : '_removeFocus',
      'change input'      : '_markChanged'
  },


  constructor : function(repo) {
    this.events       = _.extend({}, this.events, this.dataEvents);
    this.repo         = repo;
    this._mainJST = JST['repo/repo_dialog'];
    _.bindAll(this, 'render', 'saveAndClose', 'showErrors');
    dc.ui.Dialog.call(this, {mode : 'custom', title : _.t('edit_repo'), saveText : _.t('save') });
    this.repo.on('invalid', this.showErrors);

    this.render();
    $(document.body).append(this.el);
  },


  render : function() {
    //Base dialog object needs
    dc.ui.Dialog.prototype.render.call(this);
    this._container = this.$('.custom');

    //Main
    this._container.html(this._mainJST({
      repo_name      : this.repo.get('repo_name') ? this.repo.get('repo_name').replace(/\"/g,'&quot;') : ''
    }));

    return this;
  },


  save : function(success) {
    _thisView = this;

    //Clear error class from all inputs
    $('input').removeClass('error');

    //Push repo name from view to model
    this.repo.set({
      repo_name:     this.$('#repo_name').val()
    });

    //Trigger save
    this.repo.save({},{success: success});
  },


  saveAndClose: function() {
    _thisView = this;
    this.save(function(){
        _thisView.close();
    });
  },

  //Handler for errors returned from model validation
  showErrors: function(model, errors) {
    //Handle first error only
    if(errors[0].class == 'name'){ this.$('#repo_name').addClass('error'); }

    return this.error(errors[0].message);
  },


  // On change, mark input field as dirty.
  _markChanged : function(e) {
      $(e.target).addClass('change');
  }

}, {

  // This static method is used for conveniently opening the dialog for
  // any selected repo.
  open : function(repo) {
    new dc.ui.RepoDataDialog(repo);
  }

});
