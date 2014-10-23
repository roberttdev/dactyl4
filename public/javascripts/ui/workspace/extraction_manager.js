dc.ui.ExtractionManager = Backbone.View.extend({
  id          : 'extraction_manager_container',
  className   : 'extraction_tab_content',
  autocomplete: [],

  events: {
    'click #add_filter_point'     : 'addFilterPoint',
    'click #remove_filter_point'  : 'removeFilterPoint'
  },

  initialize: function(options){
    this.options = _.extend(this.options, options);
    this._mainJST = JST['workspace/extraction_main'];
    _.bindAll(this, 'open', 'render', 'addFilterPoint', 'removeFilterPoint', 'requestAutocompleteUpdate', 'updateAutocomplete');
    dc.app.navigation.bind('tab:extraction', this.open);
  },


  render: function() {
    this.$el = $('#' + this.id);
    //Main
    this.$el.html(this._mainJST(this.options));

    $('.lookup_box').keyup(this.requestAutocompleteUpdate);
    $('.lookup_box').autocomplete({source: this.autocomplete});

    this.delegateEvents();

    return this.$el;
  },


  open: function() {
    dc.app.navigation.open('extraction', true);
    Backbone.history.navigate('extraction');
    this.render();
  },


  addFilterPoint: function() {
    if( this.checkFilterValues() ) {
      var filterVal = $('#filter_lookup').val() + ' = ' + $('#filter_value').val();
      $('#selected_filters').append($('<option>', {
        value: filterVal,
        text: filterVal
      }));

      $('#filter_lookup').val('');
      $('#filter_value').val('');
    }
  },


  removeFilterPoint: function() {
    $('#selected_filters option:selected').remove();
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
  },


  requestAutocompleteUpdate: function(event) {
    var searchTerm = $(event.target).val();
    if(searchTerm.length > 1) {
      $.ajax({
        url: '/annotations/search',
        contentType: 'application/json; charset=utf-8',
        type: 'get',
        data: JSON.stringify({'search_term': searchTerm}),
        success: function (response) {
          this.updateAutocomplete(response);
        }
      })
    }else{
      this.autocomplete = [];
    }
  },


  updateAutocomplete: function(response) {

  }
});
