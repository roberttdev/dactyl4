dc.ui.AdminAccounts = Backbone.View.extend({

  // Keep in sync with account.rb and accounts.js
  DISABLED      : 0,
  ADMINISTRATOR : 1,
  CONTRIBUTOR   : 2,
  REVIEWER      : 3,
  FREELANCER    : 4,

  render : function() {
    $(this.el).html(JST.admin_accounts({}));
    var rows = Accounts.map(function(account) {
      return (new dc.ui.AccountView({model : account, kind : 'admin'})).render().el;
    });
    this.$('tbody').append(rows);
    return this;
  },

  isAdmin : function() {
    return this.get('role') == this.ADMINISTRATOR;
  }

});
dc.ui.Admin = Backbone.View.extend({

  GRAPH_OPTIONS : {
    xaxis     : {mode : 'time', minTickSize: [1, "day"]},
    yaxis     : {},
    legend    : {show : false},
    series    : {lines : {show : true, fill : false}, points : {show : false}},
    grid      : {borderWidth: 1, borderColor: '#222', labelMargin : 7, hoverable : true}
  },

  DATE_TRIPLETS : /(\d+)(\d{3})/,

  DATE_FORMAT : "%b %d, %y",

  // Quick tags for the instances we know about. Purely for convenience.
  INSTANCE_TAGS : {
    'i-0d4e9065': 'staging',
    'i-a3466ecb': 'app01',
    'i-4752792f': 'db01',
    'i-c47d78b9': 'worker01',
    'i-c41216b9': 'worker02',
    'i-c61216bb': 'worker03',
    'i-c01216bd': 'worker04'
  },

  id        : 'statistics',
  className : 'serif',

  events : {
    'plothover .chart':           '_showTooltop',
    'click #instances .minus':    '_terminateInstance',
    'click .more_top_documents':  '_loadMoreTopDocuments',
    'click #load_all_accounts':   '_loadAllAccounts',
    'click .account_list .sort':  '_sortAccounts'
  },

  ACCOUNT_COMPARATORS : {
    name           : dc.model.AccountSet.prototype.comparator,
    email          : function(account){ return account.get('email').toLowerCase(); },
    organization   : function(account){ return account.get('orgnization_name').toLowerCase(); },
    document_count : function(account){ return -(account.get('public_document_count') || 0 + account.get('private_document_count') || 0); },
    page_count     : function(account){ return -account.get('page_count') || 0; }
  },

  initialize : function(options) {
    _.bindAll(this, 'renderCharts', 'launchWorker', 'reprocessFailedDocument', 'vacuumAnalyze', 'optimizeSolr', '_loadAllAccounts');
    this._tooltip = new dc.ui.Tooltip();
    this._actionsMenu = this._createActionsMenu();
    $(window).bind('resize', this.renderCharts);
  },

  render : function() {
    $(this.el).html(JST.statistics(this.data()));
    $('#topbar').append(this._actionsMenu.render().el);
    _.defer(this.renderCharts);
    if (Accounts.length) _.defer(this._loadAllAccounts);

    return this;
  },

  renderCharts : function() {
    this.$('.chart').html('');
    $.plot($('#daily_docs_chart'),  [this._series(stats.daily_documents, 'Document', 1), this._series(stats.daily_pages, 'Page', 2)], this.GRAPH_OPTIONS);
    $.plot($('#weekly_docs_chart'), [this._series(stats.weekly_documents, 'Document', 1), this._series(stats.weekly_pages, 'Page', 2)], this.GRAPH_OPTIONS);
    $.plot($('#daily_hits_chart'),  [this._series(stats.daily_hits_on_documents, 'Document Hit'), this._series(stats.daily_hits_on_notes, 'Note Hit'), this._series(stats.daily_hits_on_searches, 'Search Hit')], this.GRAPH_OPTIONS);
    $.plot($('#weekly_hits_chart'), [this._series(stats.weekly_hits_on_documents, 'Document Hit'), this._series(stats.weekly_hits_on_notes, 'Note Hit'), this._series(stats.weekly_hits_on_searches, 'Search Hit')], this.GRAPH_OPTIONS);
  },

  // Convert a date-hash into JSON that flot can properly plot.
  _series : function(data, title, axis) {
    return {
      title : title,
      yaxis : axis,
      color : axis == 1 ? '#7EC6FE' : '#199aff',
      data  : _.sortBy(_.map(data, function(val, key) {
        return [parseInt(key, 10) * 1000, val];
      }), function(pair) {
        return pair[0];
      })
    };
  },

  renderAccounts : function() {
    this.$('#accounts_wrapper').html((new dc.ui.AdminAccounts()).render().el);
  },

  data : function() {
    var acl = stats.documents_by_access, a = dc.access;
    return {
      total_documents               : this._format(this.totalDocuments()),
      embedded_documents            : this._format(stats.embedded_documents),
      total_pages                   : this._format(stats.total_pages),
      average_page_count            : this._format(stats.average_page_count),
      public_docs                   : this._format(acl[a.PUBLIC] || 0),
      private_docs                  : this._format((acl[a.PRIVATE] || 0) + (acl[a.ORGANIZATION] || 0) + (acl[a.EXCLUSIVE] || 0)),
      pending_docs                  : this._format(acl[a.PENDING] || 0),
      error_docs                    : this._format(acl[a.ERROR] || 0),
      instance_tags                 : this.INSTANCE_TAGS,
      remote_url_hits_last_week     : this._format(stats.remote_url_hits_last_week),
      remote_url_hits_all_time      : this._format(stats.remote_url_hits_all_time),
      count_organizations_embedding : this._format(stats.count_organizations_embedding),
      count_total_collaborators     : this._format(stats.count_total_collaborators)

    };
  },

  totalDocuments : function() {
    return _.reduce(stats.documents_by_access, function(sum, value) {
      return sum + value;
    }, 0);
  },

  launchWorker : function() {
    dc.ui.Dialog.confirm('Are you sure you want to launch a new Medium Compute<br />\
      EC2 instance for document processing, on <b>production</b>?', function() {
      $.post('/admin/launch_worker', function() {
        dc.ui.Dialog.alert(
          'The worker instance has been launched successfully.\
          It will be a few minutes before it comes online and registers with CloudCrowd.'
        );
      });
      return true;
    });
  },

  vacuumAnalyze : function() {
    $.post('/admin/vacuum_analyze', function() {
      dc.ui.Dialog.alert('The vacuum background job was started successfully.');
    });
  },

  optimizeSolr : function() {
    $.post('/admin/optimize_solr', function() {
      dc.ui.Dialog.alert('The Solr optimization task was started successfully.');
    });
  },

  forceBackup : function() {
    $.post('/admin/force_backup', function() {
      dc.ui.Dialog.alert('The database backup job was started successfully.');
    });
  },

  reprocessFailedDocument : function() {
    dc.ui.Dialog.confirm('Are you sure you want to re-import the last failed document?', function() {
      $.post('/admin/reprocess_failed_document', function() {
        window.location.reload(true);
      });
      return true;
    });
  },

  _terminateInstance : function(e) {
    var instanceId = $(e.target).attr('data-id');
    dc.ui.Dialog.confirm('Are you sure you want to terminate instance <b>' + instanceId + '</b>?', function() {
      $.post('/admin/terminate_instance', {instance: instanceId}, function() {
        dc.ui.Dialog.alert('Instance <b>' + instanceId + '</b> is shutting down.');
      });
      return true;
    });
  },

  _sortAccounts : function(e) {
    var sort = $(e.target).attr('data-sort');
    Accounts.comparator = this.ACCOUNT_COMPARATORS[sort];
    Accounts.sort();
    this.renderAccounts();
    $('.account_list .sort_' + sort).addClass('active');
  },

  // Create a tooltip to show a hovered date.
  _showTooltop : function(e, pos, item) {
    if (!item) return this._tooltip.hide();
    var count = item.datapoint[1];
    var date  = $.plot.formatDate(new Date(item.datapoint[0]), this.DATE_FORMAT);
    var title = dc.inflector.pluralize(item.series.title, count);
    this._tooltip.show({
      left : pos.pageX,
      top  : pos.pageY,
      title: count + ' ' + title,
      text : date
    });
  },

  _loadAllAccounts : function() {
    $('#load_all_accounts').hide();
    $('.minibutton.download_csv').hide();
    var finish = _.bind(function() {
      this.renderAccounts();
      this._addCountsToAccounts();
      $('tr.accounts_row').show();
    }, this);
    if (Accounts.length) return finish();
    $.getJSON('/admin/all_accounts', {}, _.bind(function(resp) {
      Accounts.reset(resp.accounts);
      delete resp.accounts;
      _.extend(stats, resp);
      finish();
    }, this));
  },

  // Loads the top 100 published documents, sorted by number of hits in the past year.
  _loadMoreTopDocuments : function(e) {
    $.getJSON('/admin/hits_on_documents', {}, _.bind(this._displayMoreTopDocuments, this));
  },

  // Displays all top documents, retrieved through AJAX.
  _displayMoreTopDocuments : function(data) {
    TopDocuments.reset(data);
    this.$('.top_documents_list').replaceWith(JST['top_documents']({}));
    this.$('.top_documents_label_year').css({'display': 'table-row'});
    this.$('.top_documents_label_week').css({'display': 'none'});
  },

  // Format a number by adding commas in all the right places.
  _format : function(number) {
    var parts = (number + '').split('.');
    var integer = parts[0];
    var decimal = parts.length > 1 ? '.' + parts[1] : '';
    while (this.DATE_TRIPLETS.test(integer)) {
      integer = integer.replace(this.DATE_TRIPLETS, '$1,$2');
    }
    return integer + decimal;
  },

  _createActionsMenu : function() {
    return new dc.ui.Menu({
      label   : 'Administrative Actions',
      id      : 'admin_actions',
      items   : [
        {title : 'Add an Organization',       onClick : function(){ window.location = '/admin/signup'; }},
        {title : 'View CloudCrowd Console',   onClick : function(){ window.location = CLOUD_CROWD_SERVER; }},
        {title : 'Reprocess Last Failed Doc', onClick : this.reprocessFailedDocument},
        {title : 'Force a DB Backup to S3',   onClick : this.forceBackup},
        {title : 'Vacuum Analyze the DB',     onClick : this.vacuumAnalyze},
        {title : 'Optimize the Solr Index',   onClick : this.optimizeSolr},
        {title : 'Launch a Worker Instance',  onClick : this.launchWorker},
        {title : 'Edit Featured Reporting',   onClick : function(){ window.location = '/admin/featured'; } }
      ]
    });
  },

  _addCountsToAccounts : function() {
    Accounts.each(function(acc) {
      acc.set({
        public_document_count   : stats.public_per_account[acc.id],
        private_document_count  : stats.private_per_account[acc.id],
        page_count              : stats.pages_per_account[acc.id]
      });
    });
  }

});

dc.ui.FeaturedReport = Backbone.View.extend({

  attributes: {
    'class': 'report'
  },

  events: {
    'click .ok'         : 'save',
    'click .edit_glyph' : 'edit',
    'click .cancel'     : 'cancel',
    'click .delete'     : 'deleteReport'
  },

  initialize: function(options) {
    _.bindAll(this,'_onError','_onSuccess');
  },

  renderTmpl: function( editing ){
    var tmpl = ( editing ? JST['featured_report_edit'] : JST['featured_report_display'] ),
        json = this.model.toJSON();
    this.$el.html( tmpl( json ) ).attr('data-id', this.model.id );
  },

  render: function(){
    this.renderTmpl( this.model.isNew() );

    return this;
  },

  cancel: function(){
    if ( this.model.isNew() ){ // hmm how to kill ourselves?
      // get our parent to do it for us
      this.model.collection.remove( this.model );
    } else { 
      this.render();
    }
  },

  deleteReport: function(){
    this.model.destroy({
      success: function(model,resp){
        model.collection.remove( model );
      }
    });
  },

  edit: function(){
    this.renderTmpl( true );
  },

  _onSuccess : function(model, resp) {
    this.render();
    dc.ui.spinner.hide();
  },

  _onError : function(model, resp) {
    resp = JSON.parse(resp.responseText);
    if ( resp.errors ){
      this.$('.errors').html( "The following errors were encountered:<ul>" + 
                              _.reduce( resp.errors, function(memo,err){ return memo + '<li>'+err+'</li>'; }, '' ) + 
                              '</ul>' );
    }
    dc.ui.spinner.hide();
  },

  save: function(){
    dc.ui.spinner.show( 'Saving' );
    this.model.save( this.$('form.edit').serializeJSON(), {
      error: this._onError,
      success: this._onSuccess
    });

  }


});

dc.ui.FeaturedReporting = Backbone.View.extend({

  attributes: {
    'class': 'featured_reports'
  },

  events: {
    'click .toAdmin' : 'visitAdmin',
    'click .reload'  : 'reload',
    'click .add'     : 'addReport'
  },

  initialize: function(options) {
    _.bindAll(this,'appendReport','prependReport','render','saveSortOrder');
    this.collection.bind( 'reset',  this.render );
    this.collection.bind( 'add',    this.prependReport );
    this.collection.bind( 'remove', this.render );
  },

  saveSortOrder: function(){
    var ids = _.map( this.$('.listing .report[data-id]'), function( el ){
      return el.getAttribute('data-id');
    });
    $.ajax( this.collection.url + '/present_order', {
      data: { order: ids }
    } );
  },

  addReport: function(){
    this.collection.add({ });

  },

  prependReport: function( model ){
    var report = new dc.ui.FeaturedReport( { model: model });
    this.$('.listing').prepend( report.render().el );
  },

  appendReport: function( model ){
    var report = new dc.ui.FeaturedReport( { model: model });
    this.$('.listing').append( report.render().el );
  },

  render: function() {
    this.$el.html( JST.featured_reporting( {} ) );

    this.collection.each( this.appendReport );
    this.$('.listing').sortable({
      placeholder: "drop-placeholder",
      forcePlaceholderSize: true,
      stop:  this.saveSortOrder
    });
    return this;
  },

  reload: function() {
    this.collection.fetch();
  },

  visitAdmin: function() {
    window.location = '/admin/';
  }

});
(function(){
window.JST = window.JST || {};

window.JST['admin_accounts'] = _.template('<table class="account_list">\n  <thead>\n    <td></td>\n    <td><span class="sort sort_name" data-sort="name">Name</span></td>\n    <td><span class="sort sort_email" data-sort="email">Email</span></td>\n    <td><span class="sort sort_organization" data-sort="organization">Organization</span></td>\n    <td><span class="sort sort_document_count" data-sort="document_count">Documents</span></td>\n    <td><span class="sort sort_page_count" data-sort="page_count">Pages</span></td>\n    <td></td>\n    <td></td>\n  </thead>\n  <tbody>\n    \n  </tbody>\n</table>');
window.JST['featured_report_display'] = _.template('  <div class="controls">\n    <div class="icon edit_glyph">&#65279;</div>\n  </div>\n  <h6>\n    <a href="<%= url %>"><u><%= title %></u></a>\n    <small><i><%= organization %></i>, <%= article_date %></small>\n  </h6>\n  <%= writeup_html %>\n');
window.JST['featured_report_edit'] = _.template('<form class="edit">\n  <div class="errors"></div>\n  <div class="row">\n    <div class="title">\n      <label for="title" title="What is the name of the Article?">\n        Title\n      </label>\n      <div class="text_input light small">\n        <input name="title" id="title" class="attribute" type="text" value="<%= title %>" />\n      </div>\n    </div>\n\n    <div class="url">\n      <label for="url" title="Link to the article">\n        URL\n      </label>\n      <div class="text_input light small">\n        <input name="url" id="url" class="attribute" type="text" value="<%= url %>" />\n      </div>\n    </div>\n    <br class="clear"/>\n  </div>\n\n\n  <div class="row">\n    <div class="organization">\n      <label for="organization" title="Organization that created Article">\n        Organization\n      </label>\n      <div class="text_input light small">\n        <input name="organization" id="organization" class="attribute" type="text" value="<%= organization %>" />\n      </div>\n    </div>\n\n    <div class="article_date">\n      <label for="article_date" title="Date Article was created/posted">\n        Article Date <i>(YYYY-MM-DD)</i>\n      </label>\n      <div class="text_input light small">\n        <input name="article_date" id="article_date" class="attribute" type="text" value="<%= article_date %>" />\n      </div>\n    </div>\n    <br class="clear"/>\n  </div>\n  \n  <div class="row writeup">\n    <label for="writeup" title="Description of Article">\n      Writeup <i>(in <a href="http://daringfireball.net/projects/markdown/basics" target="_blank">Markdown format</a>)</i>\n    </label>\n    <textarea name="writeup" id="writeup" class="text_area" type="text"><%= writeup %></textarea>\n  </div>\n\n  <div class="minibutton warn delete" href="#">Delete</div>\n  <div class="controls">\n    <div class="minibutton cancel" href="#">Cancel</div>\n    <div class="minibutton ok" href="#">Save</div>  \n  </div>\n\n  <br class="clear"/>\n\n</form>\n');
window.JST['featured_reporting'] = _.template('\n<div class="controls actions">\n  <div class="toAdmin minibutton" href="#">Admin Dashboard</div>\n  <div class="reload minibutton" href="#">Reload</div>\n  <div class="add minibutton" href="#">Add</div>\n</div>\n\n<br class="clear"/>\n\n<div class="listing">\n\n</div>\n');
window.JST['statistics'] = _.template('<table>\n  <thead></thead>\n  <tbody>\n\n    <!-- Big Numbers -->\n\n    <tr class="data">\n      <td width="25%"><div class="number"><%= total_documents %></div></td>\n      <td width="25%"><div class="number"><%= private_docs %></div></td>\n      <td width="25%"><div class="number"><%= total_pages %></div></td>\n      <td width="25%"><div class="number"><%= average_page_count %></div></td>\n    </tr>\n    <tr class="labels">\n      <td>Total Documents</td>\n      <td>Private Documents</td>\n      <td>Total Pages</td>\n      <td>Average Pages / Document</td>\n    </tr>\n\n    <tr class="data">\n      <td width="25%"><div class="number"><%= public_docs %></div></td>\n      <td width="25%"><div class="number"><%= embedded_documents %></div></td>\n      <td width="25%"><div class="number"><%= pending_docs %></div></td>\n      <td width="25%"><div class="number"><%= error_docs %></div></td>\n    </tr>\n    <tr class="labels">\n      <td>Public Documents</td>\n      <td>Published Documents</td>\n      <td>Pending Documents</td>\n      <td>Failed or Broken Documents</td>\n    </tr>\n\n    <tr class="data">\n      <td width="25%"><div class="number"><%= remote_url_hits_last_week %></div></td>\n      <td width="25%"><div class="number"><%= remote_url_hits_all_time %></div></td>\n      <td width="25%"><div class="number"><%= count_organizations_embedding %></div></td>\n      <td width="25%"><div class="number"><%= count_total_collaborators %></div></td>\n    </tr>\n    <tr class="labels">\n      <td>Hits on published documents - past week</td>\n      <td>Hits on published documents - all time</td>\n      <td>Organizations Embedding Documents</td>\n      <td>Collaborators on Documents</td>\n    </tr>\n    \n    <!-- Document and Page Charts -->\n\n    <tr class="data">\n      <td colspan="2">\n        <div class="chart_col">\n          <div id="daily_docs_chart" class="chart"></div>\n        </div>\n      </td>\n      <td colspan="2">\n        <div class="chart_col">\n          <div id="weekly_docs_chart" class="chart"></div>\n        </div>\n      </td>\n    </tr>\n    <tr class="labels">\n      <td colspan="2">This Month: <b>Daily</b> Documents &amp; Pages</td>\n      <td colspan="2">All Time: <b>Weekly</b> Documents &amp; Pages</td>\n    </tr>\n    \n    <!-- Hit Charts -->\n\n    <tr class="data">\n      <td colspan="2">\n        <div class="chart_col">\n          <div id="daily_hits_chart" class="chart"></div>\n        </div>\n      </td>\n      <td colspan="2">\n        <div class="chart_col">\n          <div id="weekly_hits_chart" class="chart"></div>\n        </div>\n      </td>\n    </tr>\n    <tr class="labels">\n      <td colspan="2">This Month: <b>Daily</b> Hits on Published Documents</td>\n      <td colspan="2">All Time: <b>Weekly</b> Hits on Published Documents</td>\n    </tr>\n    \n    <!-- Recent 5 docs -->\n\n    <tr class="data">\n      <td colspan="4">\n        <table class="documents">\n          <thead>\n            <td>Cover</td>\n            <td>ID</td>\n            <td>Title</td>\n            <td>Contributor</td>\n            <td>Organization</td>\n            <td>Pages</td>\n            <td></td>\n          </thead>\n          <tbody>\n            <% _.each(Documents.models.reverse(), function(doc) { %>\n              <tr>\n                <td class="first"><img class="doc" src="<%= doc.get(\'thumbnail_url\') %>" /></td>\n                <td><%= doc.get(\'id\') %></td>\n                <td><%= doc.get(\'public\') ? dc.inflector.truncate(doc.get(\'title\') || \'\', 50) : \'<i>private</i>\' %></td>\n                <td><%= doc.get(\'account_name\') %></td>\n                <td><%= doc.get(\'organization_name\') %></td>\n                <td><%= doc.get(\'page_count\') %></td>\n                <td class="last"></td>\n              </tr>\n            <% }); %>\n          </tbody>\n        </table>\n      </td>\n    </tr>\n    <tr class="labels">\n      <td colspan="4">Most Recent 5 Uploaded Documents</td>\n    </tr>\n    \n    <!-- Popular Docs -->\n\n    <%= JST[\'top_documents\']({}) %>\n    <tr class="labels top_documents_label_week">\n      <td colspan="4">\n        <div class="float_right more_top_documents text_link">All Published Documents</div>\n        <a class="float_right download_csv text_link" href="/admin/top_documents_csv.csv">Download CSV</a></div>\n        Top 5 Most Popular Published Documents - Past 7 days\n      </td>\n    </tr>\n    <tr class="labels top_documents_label_year">\n      <td colspan="4">\n        Most Popular Published Documents - Past year\n      </td>\n    </tr>\n    \n    <!-- Popular Notes -->\n\n    <%= JST[\'top_notes\']({}) %>\n    <tr class="labels top_notes_label_week">\n      <td colspan="4">\n        Top 5 Most Popular Published Notes - Past 7 days\n      </td>\n    </tr>\n    \n    <!-- Popular Notes -->\n\n    <%= JST[\'top_searches\']({}) %>\n    <tr class="labels top_searches_label_week">\n      <td colspan="4">\n        Top 5 Most Popular Search Embeds - Past 7 days\n      </td>\n    </tr>\n    \n    <!-- Breakdown by the numbers -->\n    \n    <tr class="data">\n      <td colspan="4">\n        <table id="numbers">\n          <thead>\n            <td>Model</td>\n            <td>Past Day</td>\n            <td>Past Week</td>\n            <td>Past Month</td>\n            <td>Past 6 Months</td>\n            <td>Total</td>\n            <td></td>\n          </thead>\n          <tbody>\n            <% _.each(stats.numbers, function(numbers, model) { %>\n              <tr>\n                <td class="first"><%= model %></td>\n                <td><%= numbers.day %></td>\n                <td><%= numbers.week %></td>\n                <td><%= numbers.month %></td>\n                <td><%= numbers.half_year %></td>\n                <td><%= numbers.total %></td>\n                <td class="last"></td>\n              </tr>\n            <% }); %>\n          </tbody>\n        </table>\n      </td>\n    </tr>\n    <tr class="labels">\n      <td colspan="5">Breakdown by the Numbers</td>\n    </tr>\n    \n    <!-- EC2 Instances -->\n\n    <tr class="data">\n      <td colspan="4">\n        <table id="instances">\n          <thead>\n            <td>Instance Type</td>\n            <td>Tag</td>\n            <td>ID</td>\n            <td>State</td>\n            <td>DNS (External)</td>\n            <td>DNS (Internal)</td>\n            <td></td>\n          </thead>\n          <tbody>\n            <% _.each(stats.instances, function(instance) { %>\n              <% var id = instance.aws_instance_id; %>\n              <tr>\n                <td><%= instance.aws_instance_type %></td>\n                <td><%= instance_tags[id] || \'<div class="icon minus" data-id="\' + id + \'"></div>\' %></td>\n                <td><%= id %></td>\n                <td><%= instance.aws_state %></td>\n                <td><%= instance.dns_name %></td>\n                <td><%= instance.private_dns_name %></td>\n                <td class="last"></td>\n              </tr>\n            <% }); %>\n          </tbody>\n        </table>\n      </td>\n    </tr>\n    <tr class="labels">\n      <td colspan="4">Active EC2 Instances</td>\n    </tr>\n    \n    <!-- Failed Uploads -->\n\n    <tr class="data">\n      <td colspan="4">\n        <table class="documents">\n          <thead>\n            <td>ID</td>\n            <td>Title</td>\n            <td>Contributor</td>\n            <td>Organization</td>\n            <td>Source</td>\n            <td>Pages</td>\n            <td>Date</td>\n            <td></td>\n          </thead>\n          <tbody>\n            <% _.each(FailedDocuments.models.reverse(), function(doc) { %>\n              <tr>\n                <td class="first">\n                  <a target="_blank" title="open pdf" href="<%= doc.get(\'pdf_url\') %>">\n                    <%= doc.get(\'id\') %>\n                  </a>\n                </td>\n                <td><%= doc.get(\'public\') ? dc.inflector.truncate(doc.get(\'title\') || \'\', 50) : \'<i>private</i>\'  %></td>\n                <td><%= doc.get(\'account_name\') %></td>\n                <td><%= doc.get(\'organization_name\') %></td>\n                <td><%= doc.get(\'public\') ? dc.inflector.truncate(doc.get(\'source\') || \'\', 25) : \'<i>private</i>\'  %></td>\n                <td><%= doc.get(\'page_count\') %></td>\n                <td><%= doc.get(\'created_at\') %></td>\n                <td class="last"></td>\n              </tr>\n            <% }); %>\n          </tbody>\n        </table>\n      </td>\n    </tr>\n    <tr class="labels">\n      <td colspan="4">Most Recent 3 Failed Uploads</td>\n    </tr>\n    \n    <!-- Accounts -->\n\n    <tr class="data accounts_row" style="display:none;">\n      <td colspan="4">\n        <div id="accounts_wrapper">\n        </div>\n      </td>\n    </tr>\n    <tr class="labels accounts_row" style="display:none;">\n      <td colspan="4">\n        <a class="float_right download_csv text_link" href="/admin/accounts_csv.csv">Download CSV</a>\n        All Accounts and Organizations\n      </td>\n    </tr>\n\n  </tbody>\n</table>\n\n<div id="load_all_accounts" class="minibutton float_left">Load All Accounts</div>\n<a class="minibutton download_csv float_left" href="/admin/accounts_csv.csv">Download CSV</a>\n<br class="clear" />');
window.JST['top_documents'] = _.template('\n<tr class="data top_documents_list">\n  <td colspan="4">\n    <table class="documents">\n      <thead>\n        <td>Cover</td>\n        <td>ID</td>\n        <td>Title</td>\n        <td>Contributor</td>\n        <td>Organization</td>\n        <td>Hits</td>\n        <td>Embed Date</td>\n        <td></td>\n      </thead>\n      <tbody>\n        <% _.each(_.sortBy(TopDocuments.models, function(doc){ return -doc.get(\'hits\')}), function(doc) { %>\n          <tr>\n            <td class="first"><img class="doc" src="<%= doc.get(\'thumbnail_url\') %>" /></td>\n            <td><%= doc.get(\'document_id\') %></td>\n            <td><a href="<%= doc.publishedUrl() %>"><%= doc.get(\'public\') ? dc.inflector.truncate(doc.get(\'title\') || \'\', 50) : \'<i>private</i>\' %></a></td>\n            <td><%= doc.get(\'account_name\') %></td>\n            <td><%= doc.get(\'organization_name\') %></td>\n            <td><%= doc.get(\'hits\') %></td>\n            <td><%= doc.get(\'first_recorded_date\') %></td>\n            <td class="last"></td>\n          </tr>\n        <% }); %>\n      </tbody>\n    </table>\n  </td>\n</tr>');
window.JST['top_notes'] = _.template('\n<tr class="data top_notes_list">\n  <td colspan="4">\n    <table class="notes documents">\n      <thead>\n        <td>Cover</td>\n        <td>ID</td>\n        <td>Title</td>\n        <td>Contributor</td>\n        <td>Organization</td>\n        <td>Hits</td>\n        <td>Embed Date</td>\n        <td></td>\n      </thead>\n      <tbody>\n        <% _.each(_.sortBy(TopNotes.models, function(note){ return -note.get(\'hits\')}), function(note) { %>\n          <tr>\n            <td class="first"><img class="doc" src="<%= note.document.get(\'thumbnail_url\') %>" /></td>\n            <td>\n              <b><%= note.get(\'id\') %></b><br />\n              <%= note.get(\'document_id\') %>\n            </td>\n            <td>\n              <b><a href="<%= note.get(\'url\') %>"><%= dc.inflector.truncate(note.get(\'title\') || \'\', 50) %></a></b><br />\n              <a href="<%= note.document.publishedUrl() %><%= \'#document/p\' + note.get(\'page\') + \'/a\' + note.get(\'id\') %>"><%= note.document.get(\'access\') == dc.access.PUBLIC ? dc.inflector.truncate(note.document.get(\'title\') || \'\', 50) : \'<i>private</i>\' %></a>\n            </td>\n            <td><%= note.document.get(\'account_name\') %></td>\n            <td><%= note.document.get(\'organization_name\') %></td>\n            <td>\n              <%= note.get(\'hits\') %>\n            </td>\n            <td><%= note.get(\'first_recorded_date\') %></td>\n            <td class="last"></td>\n          </tr>\n        <% }); %>\n      </tbody>\n    </table>\n  </td>\n</tr>');
window.JST['top_searches'] = _.template('\n<tr class="data top_searches_list">\n  <td colspan="4">\n    <table class="searches">\n      <thead>\n        <td>Search Query</td>\n        <td>Hits</td>\n        <td>Embed Date</td>\n        <td></td>\n      </thead>\n      <tbody>\n        <% _.each(_.sortBy(TopSearches.models, function(query){ return -query.get(\'hits\')}), function(query) { %>\n          <tr>\n            <td>\n              <b><%= dc.inflector.truncate(query.get(\'search_query\') || \'\', 80) %></a></b><br />\n              <a href="<%= query.get(\'url\') %>"><%= dc.inflector.truncate(query.get(\'url\') || \'\', 100) %></a>\n            </td>\n            <td>\n              <%= query.get(\'hits\') %>\n            </td>\n            <td><%= query.get(\'first_recorded_date\') %></td>\n            <td class="last"></td>\n          </tr>\n        <% }); %>\n      </tbody>\n    </table>\n  </td>\n</tr>');
})();