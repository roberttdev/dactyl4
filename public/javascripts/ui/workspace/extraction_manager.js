dc.ui.ExtractionManager = Backbone.View.extend({
  id          : 'extraction_manager_container',
  className   : 'extraction_tab_content',

  events: {
    'click #add_filter_point'     : 'addFilterPoint',
    'click #remove_filter_point'  : 'removeFilterPoint',
    'click #add_endpoint'         : 'addEndpoint',
    'click #remove_filter_point'  : 'removeEndpoint',
    'click #submit_extraction'    : 'submitRequest'
  },

  initialize: function(options){
    this.filters = {}
    this.options = _.extend(this.options, options);
    this._mainJST = JST['workspace/extraction_main'];
    _.bindAll(this, 'open', 'render', 'addFilterPoint', 'removeFilterPoint');
    dc.app.navigation.bind('tab:extraction', this.open);
  },


  render: function() {
    this.$el = $('#' + this.id);
    //Main
    this.$el.html(this._mainJST(this.options));

    $('#endpoint_lookup').autocomplete({source: '/groups/search'});
    $('#filter_lookup').autocomplete({source: '/annotations/search'});
    $('#account_name').autocomplete({source: '/accounts/search_view_only'})

    this.delegateEvents();

    return this.$el;
  },


  submitRequest: function() {
    var endpoints = $('#selected_endpoints option').map(function(){ return this.value; }).get();
    var account_name = $('#account_name').val();
    var file_format = $('input[name="file_format"]:checked').val();
    var filters = [];
    $('#selected_filters option').each(function(iter, opt){ filters.push($(opt).val()); });


    //Validate values
    if( account_name.length > 0 && account_name.indexOf(',') < 0 ){
      dc.ui.Dialog.alert('Invalid account name.  Name must be in the format of "Last Name, First Name".');
      return;
    }
    if( endpoints.length == 0 && file_format == 'csv' ){
      dc.ui.Dialog.alert('An endpoint is required for CSV extraction.  Please select an endpoint.');
      return;
    }


    var submitData = {
      endpoints: endpoints,
      filters: this.filters,
      account_name: account_name,
      file_format: file_format
    };

    var _workingDialog = dc.ui.Dialog.progress('Extracting..');

    $.ajax({
      url: '/extraction/create',
      contentType: 'application/json; charset=utf-8',
      type: 'post',
      data: JSON.stringify(submitData),
      success: function(){
        _workingDialog.close();
        dc.ui.Dialog.alert('Extraction Complete!')
      },
      error: function(response){
        _workingDialog.close();
        dc.ui.Dialog.alert(response.responseText.substring(0,50));
      }
    });
  },


  open: function() {
    dc.app.navigation.open('extraction', true);
    Backbone.history.navigate('extraction');
    this.render();
  },


  addFilterPoint: function() {
    if( this.checkFilterValues() ) {
      var filter_name = $('#filter_lookup').val();
      var filter_values = $('#filter_value').val();

      //Update JSON representation
      var placeholder = '#ABSURDLY_IMPROBABLE_PLACEHOLDER#';
      var holder_regex = /\#ABSURDLY_IMPROBABLE_PLACEHOLDER\#/g;
      this.filters[filter_name] = $.csv.toArray(filter_values.replace(/\\\'/g, placeholder), {delimiter: "'"});
      for(var i=0; i < this.filters[filter_name].length; i++){
        this.filters[filter_name][i] = this.filters[filter_name][i].replace(holder_regex, '\'');
      }

      //Update UI
      $('#selected_filters').append($('<option>', {
        value: filter_name,
        text: "'" + filter_name + "' = " + filter_values
      }));

      $('#filter_lookup').val('');
      $('#filter_value').val('');
    }
  },


  removeFilterPoint: function() {
    delete this.filters[$('#selected_filters option:selected').val()];
    $('#selected_filters option:selected').remove();
  },


  addEndpoint: function() {

    var endpoint_name = $('#endpoint_lookup').val();

    //Update UI
    $('#selected_endpoints').append($('<option>', {
      value: endpoint_name,
      text: endpoint_name
    }));

    $('#endpoint_lookup').val('');
  },


  removeEndpoint: function() {
    $('#selected_endpoints option:selected').remove();
  },


  checkFilterValues: function() {
    //Check that field name is not blank
    if( $('#filter_lookup').val().length == 0 ){
      dc.ui.Dialog.alert('You must enter a point name.');
      return false;
    }

    if( $('#filter_value').val().length == 0 ){
      dc.ui.Dialog.alert('You must enter a point value.');
      return false;
    }

    var csvMatch = /^('[^']*')(,'[^']*')*$/;
    var filterVal = $('#filter_value').val().replace(/\\'/g, '#');
    if( !filterVal.match(csvMatch) ){
      dc.ui.Dialog.alert('The point value(s) are incorrectly formatted.');
      return false;
    }

    return true;
  }

});
