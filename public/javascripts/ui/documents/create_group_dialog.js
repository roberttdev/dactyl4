dc.ui.CreateGroupDialog = dc.ui.Dialog.extend({

  id                : 'create_group_dialog',
  className         : 'dialog new_css_dialog',
  mode              : 'create',

  dataEvents : {
      'click .cancel'     : 'close',
      'click .ok'         : 'saveAndClose',
      'focus input'       : '_addFocus',
      'focus textarea'    : '_addFocus',
      'blur input'        : '_removeFocus',
      'blur textarea'     : '_removeFocus'
  },


  constructor : function(group) {
    this.model      = group;
    this.events     = _.extend({}, this.events, this.dataEvents);
    this._mainJST   = JST['document/create_group_dialog'];
    _.bindAll(this, 'render', 'saveAndClose', 'showErrors', 'updateGroupName');
    dc.ui.Dialog.call(this, {mode : 'custom', title : _.t('create_group'), saveText : _.t('save') });

    //Set mode (create or edit)
    this.mode = this.model.id == null ? 'create' : 'edit';

    this.render();

    $(document.body).append(this.el);
  },


  render : function() {
    //Base dialog object needs
    dc.ui.Dialog.prototype.render.call(this);
    this._container = this.$('.custom');

    //Main template
    this._container.html(this._mainJST({
        name:      this.model.get('name'),
        extension: this.model.get('extension'),
        mode:      this.mode
    }));

    $('.typeahead').typeahead({
          hint: true,
          highlight: true,
          minLength: 0
        },
        {
          name: 'templateArray',
          displayKey: 'value',
          source: FuncUtils.substringMatcher(dc.app.editor.templateArray)
        }
    );

    $('.typeahead').bind('typeahead:selected', this.updateGroupName);

    return this;
  },


  saveAndClose : function(success) {
    _thisDialog = this;

    //Clear error class from all inputs
    $('input').removeClass('error');

    //Validate that group name is not blank.
    if( _thisDialog.$('#group_name').val() == null || _thisDialog.$('#group_name').val().length == 0 ){
      _thisDialog.$('#group_name').addClass('error');
      return _thisDialog.error(_.t('blank_field_error'));
    }

    //Push template name to model
    _thisDialog.model.set({
      name: _thisDialog.$('#group_name').val(),
      extension: _thisDialog.$('#extension').val()
    });

    //If creating, also push template data to model (If template entered)
    if( this.mode == 'create' ) {
      var templateName = _thisDialog.$('#template_name').val();

      if( templateName && templateName.length > 0 ) {
        var templateIDs = dc.app.editor.getIDsForTemplateString(templateName);

        //Error if template name fails to match
        if (templateIDs[0] == null || ((templateName.indexOf('::') > -1) && templateIDs[1] == null)) {
          _thisDialog.$('#template_name').addClass('error');
          return _thisDialog.error(_.t('template_name_invalid'));
        }

        _thisDialog.model.set({
          template_id: templateIDs[0],
          subtemplate_id: templateIDs[1]
        });
      }
    }

    //Trigger save
    _thisDialog.model.save({}, {success: function(){ _thisDialog.close(); }});
  },


  //Handler for errors returned from model validation
  showErrors: function(model, errors) {
    //Handle first error only
    if(errors[0].class == 'name'){ this.$('#template_name').addClass('error'); }

    return this.error(errors[0].message);
  },


  //Update group name from template chosen
  updateGroupName: function(){
    var _template = this.$('#template_name').val();
    if( _template.indexOf('::') > -1 ){ _template = _template.substr(0, _template.indexOf('::')); }
    this.$('#group_name').val(_template);
  }

}, {

  // This static method is used for conveniently opening the dialog for
  // any selected template.
  open : function(group) {
    new dc.ui.CreateGroupDialog(group);
  }

});
