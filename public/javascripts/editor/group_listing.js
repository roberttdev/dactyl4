dc.ui.GroupListing = Backbone.View.extend({

  showStatus: true,
  showEdit: true,
  showDelete: true,
  showClone: true,
  showApprove: false,
  showReject: false,
  showNote: false,
  complete: false,

  events : {
    'click .edit_group'   : 'openEditGroupDialog',
    'click .delete_group' : 'confirmDelete',
    'click .clone_item'   : 'cloneGroup',
    'click .approve_item' : 'approveGroup',
    'click .reject_item'  : 'rejectGroup',
    'click .point_note'   : 'openNote'
  },

  initialize : function(options) {
    _.bindAll(this, 'render', 'confirmDelete', 'deleteGroup', 'openEditGroupDialog', 'cloneGroup', 'approveGroup', 'rejectGroup',
        'openNote', 'setApprove', 'setReject');

    this.model.on('change', this.render);

    this.showStatus = options['showStatus'] != null ? options['showStatus'] : true;
    this.complete = options['complete'] != null ? options['complete'] : false;
    this.showEdit = options['showEdit'] != null ? options['showEdit'] : true;
    this.showDelete = options['showDelete'] != null ? options['showDelete'] : true;
    this.showClone = options['showClone'] != null ? options['showClone'] : true;
    this.showApprove = options['showApprove'] != null ? options['showApprove'] : false;
    this.showReject = options['showReject'] != null ? options['showReject'] : false;
    this.showNote = options['showNote'] != null ? options['showNote'] : false;

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
    if( !this.showApprove ){ this.$('.approve_item').hide(); }
    if( !this.showReject ){ this.$('.reject_item').hide(); }
    if( !this.showNote ){ this.$('.point_note').hide(); }

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
  },

  approveGroup: function() {
    var _thisView = this;
    this.model.set({approved: true, qa_reject_note: null});
    this.model.update_approval(false, _thisView.setApprove);
  },

  rejectGroup: function() {
    var _thisView = this;
    dc.ui.QARejectDialog.open(_thisView.model, true, function(subitems_too){
        _thisView.model.update_approval(subitems_too, _thisView.setReject);
    });
  },

  openNote: function() {
    var _thisView = this;
    dc.ui.QARejectDialog.open(_thisView.model, true, function(subitems_too){
        _thisView.model.update_approval(subitems_too);
    });
  },

  //setApprove: Sets UI to approved
  setApprove: function(){
    this.$('.approve_item').hide();
    this.$('.point_note').hide();
    this.$('.row_status').removeClass('incomplete');
    this.$('.row_status').addClass('complete');
    this.$('.reject_item').show().css('display', 'inline-block');
  },


  //setReject: Sets UI to rejected
  setReject: function(){
    this.$('.reject_item').hide();
    this.$('.row_status').removeClass('complete');
    this.$('.row_status').removeClass('incomplete');
    this.$('.approve_item').show().css('display', 'inline-block');
    this.$('.point_note').show().css('display', 'inline-block');
  }

});
