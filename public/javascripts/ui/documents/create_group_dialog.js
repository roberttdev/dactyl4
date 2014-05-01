dc.ui.CreateGroupDialog = dc.ui.Dialog.extend({

  id                : 'create_group_dialog',
  className         : 'dialog tempalog',
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
    _.bindAll(this, 'render', 'saveAndClose', 'showErrors');
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
        name: this.model.get('name'),
        mode: this.mode
    }));

    this.populateTemplateSelect();

    return this;
  },


  //populateTemplateSelect: Get template list from editor and convert into drop-down options
  populateTemplateSelect: function() {
    _thisView = this;
    _thisView.$('#template_name').append('<option value="0:0">-none-</option>') ;
    $(dc.app.editor.templateList).each(function(index, template) {
        _thisView.$('#template_name').append('<option value="' + template.id + '">' + template.name + '</option>');
        $(template.subtemplates).each(function(index, subtemplate){
            _thisView.$('#template_name').append('<option value="' + template.id + ':0' + subtemplate.id +
                '">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;--' + subtemplate.sub_name + '</option>');
        });
    });
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
    _thisDialog.model.set({name: _thisDialog.$('#group_name').val()});

    //If creating, also push template data to model
    if( this.mode == 'create' ) {
        _thisDialog.model.set({
            template_id: this.$('#template_name').val().split(':')[0],
            subtemplate_id: this.$('#template_name').val().split(':')[1]
        });
    }

    //Trigger save
    _thisDialog.model.save({}, {success: function(){ _thisDialog.close(); }});
  },


  //Handler for errors returned from model validation
  showErrors: function(model, errors) {
    //Handle first error only
    if(errors[0].class == 'name'){ this.$('#template_name').addClass('error'); }

    return this.error(errors[0].message);
  }

}, {

  // This static method is used for conveniently opening the dialog for
  // any selected template.
  open : function(group) {
    new dc.ui.CreateGroupDialog(group);
  }

});
