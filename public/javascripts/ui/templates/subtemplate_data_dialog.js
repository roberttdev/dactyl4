dc.ui.SubtemplateDataDialog = dc.ui.Dialog.extend({

  id                : 'edit_subtemplate_dialog',
  className         : 'dialog tempalog',
  template          : null,
  parentTemplate    : null,
  fieldViewList     : [],

  dataEvents : {
      'click .cancel'     : 'close',
      'click .ok'         : 'saveAndClose',
      'focus input'       : '_addFocus',
      'focus textarea'    : '_addFocus',
      'blur input'        : '_removeFocus',
      'blur textarea'     : '_removeFocus',
      'change input'      : '_markChanged'
  },


  constructor : function(subtemplate, parentTemplate) {
    this.events         = _.extend({}, this.events, this.dataEvents);
    this.template       = subtemplate;
    this.parentTemplate = parentTemplate;
    this._mainJST = JST['template/subtemplate_dialog'];
    _.bindAll(this, 'render', 'createFieldViews', 'createFieldView', 'createFieldViewsAndRender',
        'saveAndClose', 'showErrors', 'removeFieldViewFromList');
    dc.ui.Dialog.call(this, {mode : 'custom', title : _.t('edit_subtemplate'), saveText : _.t('save') });
    this.template.on('invalid', this.showErrors);

    _thisView = this;

    //Clear fieldViewList in case pointers persist
    this.fieldViewList.length = 0;

    //Fetch parent and/or subtemplate fields if they haven't been pulled; otherwise, render as normal
    if(this.parentTemplate.template_fields.length == 0 && this.template.subtemplate_fields.length == 0 && subtemplate.id != null) {
        this.parentTemplate.fetchFields(function(){
            _thisView.template.fetchFields(_thisView.createFieldViewsAndRender);
        });
    } else if(this.parentTemplate.template_fields.length == 0) {
        this.parentTemplate.fetchFields(this.createFieldViewsAndRender);
    } else if(this.template.subtemplate_fields.length == 0 && subtemplate.id != null) {
        this.template.fetchFields(this.createFieldViewsAndRender);
    } else {
        this.createFieldViewsAndRender();
    }

    $(document.body).append(this.el);
  },


  render : function() {
    //Base dialog object needs
    dc.ui.Dialog.prototype.render.call(this);
    this._container = this.$('.custom');

    //Main template
    this._container.html(this._mainJST({
      name          : this.template.get('sub_name').replace(/\"/g,'&quot;')
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
      this.parentTemplate.template_fields.each(function(field) {
          _thisView.createFieldView(field);
      }, _thisView);
  },


  createFieldView: function(field) {
      _selected = false;
      _fieldMatches = this.template.subtemplate_fields.where({field_id: field.id});
      if( _fieldMatches != null && _fieldMatches.length > 0 ){ _selected = true; }
      _fieldView = new dc.ui.SubtemplateFieldListing({model: field, selected: _selected}, this);
      this.fieldViewList.push(_fieldView);
      _fieldView.on('fieldClicked', this.changeFieldStatus, this);
      return _fieldView;
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

    //Push template name from view to model
    this.template.set({sub_name: this.$('#template_name').val()});

    //Trigger save
    this.template.save({},{success: success});
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
    if(errors[0].class == 'sub_name'){ this.$('#template_name').addClass('error'); }

    return this.error(errors[0].message);
  },


  // On change, mark input field as dirty.
  _markChanged : function(e) {
      $(e.target).addClass('change');
  },


  //Change subtemplate field status and update collection. Expected arguments passed in:
  //  *field_id
  //  *action ('add' or 'delete')
  changeFieldStatus: function(args) {
      _thisView = this;
      //If subtemplate hasn't been saved, do that then return
      if(this.template.id == null){
          _thisView.save(function(){ _thisView.changeFieldStatus(args); });
      }
      else {
          _fieldId = parseInt(_fieldId);
          if (args.action == 'add') {
              _newModel = new dc.model.SubtemplateField({
                  template_id: this.parentTemplate.id,
                  subtemplate_id: this.template.id,
                  field_id: _fieldId
              });
              _newModel.save();
              this.template.subtemplate_fields.add(_newModel);
          } else if (args.action == 'delete') {
              _matchingFields = this.template.subtemplate_fields.where({field_id: _fieldId});
              if (_matchingFields != null && _matchingFields.length > 0) {
                  _matchingFields[0].destroy();
              }
          }
      }
  }


}, {

  // This static method is used for conveniently opening the dialog for
  // any selected template.
  open : function(subtemplate, parentTemplate) {
    new dc.ui.SubtemplateDataDialog(subtemplate, parentTemplate);
  }

});
