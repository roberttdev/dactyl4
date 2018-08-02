dc.ui.BaseGroupListing = Backbone.View.extend({

  showStatus: true,
  showEdit: true,
  showDelete: true,
  showClone: true,
  showApproval: false,
  showApprovalStatus: false,
  showReject: false,
  showNote: false,
  complete: false,
  strikethrough: false,

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

    this.model.on("change", this.render);

    this.showSubitemStatus = options.showSubitemStatus != null ? options.showSubitemStatus : false;
    this.complete = options.complete != null ? options.complete : false;
    this.showEdit = options.showEdit != null ? options.showEdit : true;
    this.showDelete = options.showDelete != null ? options.showDelete : true;
    this.showClone = options.showClone != null ? options.showClone : true;
    this.showApproval = options.showApproval != null ? options.showApproval : false;
    this.showApprovalStatus = options.showApprovalStatus != null ? options.showApprovalStatus : false;
    this.showNote = options.showNote != null ? options.showNote : false;
    this.strikethrough = options.strikethrough != null ? options.strikethrough : false;
    this.showGraphData = this.model.get("is_graph_data") || this.model.get("is_graph_group");

    this._mainJST = JST.group_listing;
  },


  render : function() {
    _thisView = this;
    $(this.el).html(_thisView._mainJST({
        group_id:   this.model.id,
        name:       this.model.get("extension") ? this.model.get("name") + "[" + this.model.get("extension") + "]" : this.model.get("name")
    }));

    if( !this.showGraphData ){ this.$(".graph_data").hide(); }
    if( !this.showSubitemStatus ){ this.$(".subitem_status").hide(); }
    if( !this.showEdit ){ this.$(".edit_group").hide(); }
    if( !this.showDelete ){ this.$(".delete_item").hide(); }
    if( !this.showClone ){ this.$(".clone_item").hide(); }
    if( !this.showNote ){ this.$(".point_note").hide(); }
    if( !this.showApprovalStatus ){ this.$(".row_status").hide(); }
    if( !this.showApproval ){
      this.$(".approve_item").hide();
      this.$(".reject_item").hide();
    }

    if( this.showSubitemStatus && this.model.get("unapproved_count") == 0 ){
        this.$(".subitem_status").removeClass("incomplete");
        this.$(".subitem_status").addClass("complete");
    } else {
        this.$(".subitem_status").removeClass("complete");
        this.$(".subitem_status").addClass("incomplete");
    }

    if( (this.showApproval || this.showApprovalStatus) && this.model.get("qa_approved_by") ){
      this.model.get("qa_reject_note") ? this.setReject() : this.setApprove();
    }

    if( this.strikethrough ){ this.$(".group_listing").addClass("rejected"); }

    return this;
  },


  openEditGroupDialog: function() {
    dc.ui.CreateGroupDialog.open(this.model);
  },


  //Show popup confirming template delete
  confirmDelete: function(event) {
    dc.ui.Dialog.confirm(_.t("confirm_group_delete"), this.deleteGroup);
  },


  deleteGroup: function() {
    _thisView = this;
    this.model.destroy({success: function(model) {
        $(_thisView.el).remove();
        _thisView.trigger("groupDeleted", model);
    }});
    return true;
  },


  cloneGroup: function() {
    this.trigger("requestGroupClone", this.model);
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
    this.$(".approve_item").hide();
    this.$(".point_note").hide();
    this.$(".row_status").removeClass("incomplete");
    this.$(".row_status").removeClass("rejected");
    this.$(".row_status").addClass("complete");
    if( this.showApproval ){ this.$(".reject_item").show().css("display", "inline-block"); }
  },


  //setReject: Sets UI to rejected
  setReject: function(){
    this.$(".reject_item").hide();
    this.$(".row_status").removeClass("complete");
    this.$(".row_status").removeClass("incomplete");
    this.$(".row_status").addClass("rejected");
    if( this.showApproval ){ this.$(".approve_item").show().css("display", "inline-block"); }
    if( this.showApproval ){ this.$(".point_note").show().css("display", "inline-block"); }
  }

});
