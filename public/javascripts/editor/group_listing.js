dc.ui.GroupListing = Backbone.View.extend({

  showStatus: true,
  showEdit: true,
  showDelete: true,
  showClone: true,
  complete: false,

  events : {
      'click .edit_group'   : 'openEditGroupDialog',
      'click .delete_group' : 'confirmDelete',
      'click .clone_item'  : 'cloneGroup'
  },

  initialize : function(options) {
    _.bindAll(this, 'render', 'confirmDelete', 'deleteGroup', 'openEditGroupDialog', 'cloneGroup');

    this.model.on('change', this.render);

    this.showStatus = options['showStatus'] != null ? options['showStatus'] : true;
    this.complete = options['complete'] != null ? options['complete'] : false;
    this.showEdit = options['showEdit'] != null ? options['showEdit'] : true;
    this.showDelete = options['showDelete'] != null ? options['showDelete'] : true;
    this.showClone = options['showClone'] != null ? options['showClone'] : true;

    this._mainJST = JST['group_listing'];
  },


  render : function() {
    _thisView = this;
    $(this.el).html(_thisView._mainJST({
        group_id:   this.model.id,
        name:       this.model.get('extension') ? this.model.get('name') + '[' + this.model.get('extension') + ']' : this.model.get('name')
    }));

    if( !this.showStatus ){ this.$('.row_status').hide(); }
    if( !this.showEdit ){ this.$('.edit_group').hide(); }
    if( !this.showDelete ){ this.$('.delete_item').hide(); }
    if( !this.showClone ){ this.$('.clone_item').hide(); }

    if( this.complete ){
        this.$('.row_status').removeClass('incomplete');
        this.$('.row_status').addClass('complete');
    } else {
        this.$('.row_status').removeClass('complete');
        this.$('.row_status').addClass('incomplete');
    }

    return this;
  },


  openEditGroupDialog: function() {
      //_newGroup = new dc.model.Group({parent_id: this.model.id, document_id: this.model.get('document_id')});
      //_newGroup.once('sync', function(){ this.reloadPoints(_thisView.model.id); }, this);
      dc.ui.CreateGroupDialog.open(this.model);
  },


  //Show popup confirming template delete
  confirmDelete: function(event) {
      dc.ui.Dialog.confirm(_.t('confirm_group_delete'), this.deleteGroup);
  },


  deleteGroup: function() {
      _thisView = this;
      this.model.destroy({success: function() {
          $(_thisView.el).remove();
          _thisView.trigger('groupDeleted');
      }});
      return true;
  },


  cloneGroup: function() {
    this.trigger('requestGroupClone', this.model);
  }

});
