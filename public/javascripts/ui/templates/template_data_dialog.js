dc.ui.TemplateDataDialog = dc.ui.Dialog.extend({

  id                : 'edit_template_dialog',
  className         : 'dialog tempalog',
  template          : null,
  fieldViewList     : [],

  dataEvents : {
      'click .cancel'     : 'close',
      'click .ok'         : 'saveAndClose',
      'focus input'       : '_addFocus',
      'focus textarea'    : '_addFocus',
      'blur input'        : '_removeFocus',
      'blur textarea'     : '_removeFocus',
      'change input'      : '_markChanged',
      'click #new_field'  : 'saveAndAddField'
  },


  constructor : function(template) {
    this.events       = _.extend({}, this.events, this.dataEvents);
    this.template         = template;
    this._mainJST = JST['template/template_dialog'];
    _.bindAll(this, 'render', 'createFieldViews', 'createFieldView', 'createFieldViewsAndRender',
        'addNewField', 'saveAndClose', 'saveAndAddField', 'showErrors', 'removeFieldViewFromList');
    dc.ui.Dialog.call(this, {mode : 'custom', title : _.t('edit_template'), saveText : _.t('save') });
    this.template.on('invalid', this.showErrors);

    //Clear fieldViewList in case pointers persist
    this.fieldViewList.length = 0;

    //If template already exists, fetch fields; otherwise go straight to rendering
    if(this.template.id != null) {
        this.template.fetchFields(this.createFieldViewsAndRender);
    } else {
        this.render();
    }

    $(document.body).append(this.el);
  },


  render : function() {
    //Base dialog object needs
    dc.ui.Dialog.prototype.render.call(this);
    this._container = this.$('.custom');

    //Main template
    this._container.html(this._mainJST({
      name      : this.template.get('name') ? this.template.get('name').replace(/\"/g,'&quot;') : '',
      help_url  : this.template.get('help_url') ? this.template.get('help_url').replace(/\"/g,'&quot;') : ''
    }));

    //Field listings
      this.$('.field_list').append(_.map( this.fieldViewList, function(view, cid){
          view.render();
          return view.$el;
      }, this));

    return this;
  },


  createFieldViewsAndRender: function() {
     this.createFieldViews();
     this.render();
  },


  createFieldViews: function() {
      _thisView = this;
      this.template.template_fields.each(function(field) {
          _thisView.createFieldView(field);
      }, _thisView);
  },


  createFieldView: function(field) {
      _fieldView = new dc.ui.TemplateFieldListing({model: field}, this);
      this.fieldViewList.push(_fieldView);
      _fieldView.on('destroy', this.removeFieldViewFromList, this);
      return _fieldView;
  },


  //New templates need to save themselves before adding fields.  This does that if necessary before adding a field.
  saveAndAddField: function() {
      if(this.template.id == null){
          this.save(this.addNewField);
      } else {
          this.addNewField();
      }
  },


  //Add blank field to view
  addNewField: function() {
      view = this.createFieldView(new dc.model.TemplateField());
      view.render();
      this.$('.field_list').append(view.$el);
      view.$('#field_name').focus();
  },


  //Responds to event of field view being deleted by removing from list.
  //It is passed the initiating view from the event trigger.
  removeFieldViewFromList: function(view) {
      this.fieldViewList.splice(this.fieldViewList.indexOf(view), 1);
  },


  save : function(success) {
    _thisView = this;

    //Clear error class from all inputs
    $('input').removeClass('error');

    //Validate that no field names are blank.  If one is, throw error.
    _fieldError = false;
    this.fieldViewList.every(function(view){
        if( view.$('#field_name').val() == null || view.$('#field_name').val().length == 0 ){
            view.$('#field_name').addClass('error');
            _fieldError = true;
            return false;
        }
        return true;
    });
    if(_fieldError){
        return _thisView.error(_.t('blank_field_error'));
    }

    //Push template name and URL from view to model
    this.template.set({
      name:     this.$('#template_name').val(),
      help_url: this.$('#help_url').val()
    });
    //Reset collection and re-push edited fields from view to model
    if( this.template.template_fields != null && this.template.template_fields.length > 0 ){
        this.template.template_fields.reset();
    }
    this.fieldViewList.forEach(function(view){
       if( view.$('#field_name').val() != null && view.$('#field_name').val().length > 0 ){
            _thisView.template.template_fields.add({
                id  : view.model.get('id'),
                field_name: view.$('#field_name').val(),
                template_id: _thisView.template.get('id')
            });
       }
    });

    //Trigger save
    this.template.saveAll(success);
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
    if(errors[0].class == 'name'){ this.$('#template_name').addClass('error'); }

    return this.error(errors[0].message);
  },


  // On change, mark input field as dirty.
  _markChanged : function(e) {
      $(e.target).addClass('change');
  }

}, {

  // This static method is used for conveniently opening the dialog for
  // any selected template.
  open : function(template) {
    new dc.ui.TemplateDataDialog(template);
  }

});
