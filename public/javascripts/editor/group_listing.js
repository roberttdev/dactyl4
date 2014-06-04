dc.ui.GroupListing = Backbone.View.extend({

  events : {
      'click .edit_group'   : 'openEditGroupDialog',
      'click .delete_group' : 'confirmDelete',
      'click .clone_group'  : 'cloneGroup'
  },

  initialize : function() {
    _.bindAll(this, 'render', 'confirmDelete', 'deleteGroup', 'openEditGroupDialog', 'cloneGroup');

    this.model.on('change', this.render);

    this._mainJST = JST['group_listing'];
  },


  render : function() {
    _thisView = this;
    $(this.el).html(_thisView._mainJST({
        group_id:   this.model.id,
        name:       this.model.get('extension') ? this.model.get('name') + '[' + this.model.get('extension') + ']' : this.model.get('name')
    }));

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
      this.model.destroy();
      $(this.el).remove();
      this.trigger('reloadAnnotationsRequest');
      return true;
  },


  cloneGroup: function() {
    _thisGroupView = this;
    this.model.clone(function(){ _thisGroupView.trigger('reloadPointsRequest'); });
  }

});
