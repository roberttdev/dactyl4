DC::Application.routes.draw do


  # homepage
  get '/' => 'workspace#index'

  # Internal Search API.
  get '/search/documents.json' => 'search#documents'

  # Search Embeds.
  get '/search/embed/:q/:options.:format' => 'search#embed', :q => /[^\/;,?]*/, :options => /p-(\d+)-per-(\d+)-order-(\w+)-org-(\d+)(-secure)?/
  get '/search/embed/:options.:format' => 'search#embed',    :q => /[^\/;,?]*/, :options => /p-(\d+)-per-(\d+)-order-(\w+)-org-(\d+)(-secure)?/
  # Journalist workspace and surrounding HTML.
  get '/search' => 'workspace#index'
  get '/search/preview' => 'search#preview', :as => :preview
  get '/search/restricted_count' => 'search#restricted_count'
  get '/search/:query' => 'workspace#index', :query => /.*/
  get '/help' => 'workspace#help'
  get '/help/:page' => 'workspace#help'
  get '/results' => 'workspace#index', :as => :results

  # login / logout
  scope( controller: 'authentication' ) do
    get '/signup',                        action: 'signup_info'
    match '/login',                       action: 'login', :via=>[:get,:post]
    match '/view-only-login',             action: 'view_only_login', :via=>[:get]
    get '/logout',                        action: 'logout'
    get '/auth/remote_data/:document_id', action: 'remote_data'

    # Third party auth via OmniAuth
    match '/auth/:action', :via=>[:get,:post]
    get '/auth/:provider',          :action => :blank
    get '/auth/:provider/callback', :action => :callback
  end


  # Public search.
  get '/public/search' => 'public#index'
  get '/public/search/:query' => 'public#index', :query => /.*/

  # API.
  scope( 'api', controller: 'api' ) do
    scope( via: :options, action: 'cors_options' ) do
      match 'documents/pending.:format',            allowed_methods: [:get]
      match 'documents/:id.:format',                allowed_methods: [:get, :put, :delete]
      match 'documents/:id/entities.:format',       allowed_methods: [:get]
      match 'documents/:id/note/:note_id.:format',  allowed_methods: [:get]
      match 'documents/:id/notes/:note_id.:format', allowed_methods: [:get]
      match 'projects/:id.:format',                 allowed_methods: [:get, :put, :delete]
      match 'projects.:format',                     allowed_methods: [:get, :post]
      match 'search.:format',                       allowed_methods: [:get]
      match '/measurement_fields',                  allowed_methods: [:get]
      match '/imagecrop',                           allowed_methods: [:post]
    end

    put 'documents/:id.:format',                action: 'update'
    delete 'documents/:id.:format',             action: 'destroy'
    get 'documents/:id/entities.:format',       action: 'entities'
    get 'documents/:id/note/:note_id.:format',  action: 'notes'
    get 'documents/:id/notes/:note_id.:format', action: 'notes'
    get 'documents/pending.:format',            action: 'pending'
    get 'projects/:id.:format',                 action: 'project'
    get 'projects.:format',                     action: 'projects'
    post 'projects.:format',                    action: 'create_project'
    put 'projects/:id.:format',                 action: 'update_project'
    delete 'projects/:id.:format',              action: 'destroy_project'
    get '/measurement_fields',                  action: 'measurement_fields'
    post '/imagecrop',                          action: 'crop_image'
  end

  resources :featured do
    collection { post :present_order }
  end

  #View Only Point Select
  get '/documents/view_point' => 'documents#view_point'

  #Reject DE
  put '/documents/:id/reject_de' => 'documents#reject_de'

  #Bulk Annotation Submit
  put '/documents/:document_id/annotations' => 'annotations#bulk_update'
  put '/documents/:document_id/groups/:group_id/annotations' => 'annotations#bulk_update'

  #Graph Data Submit
  post '/documents/:document_id/groups/:group_id/graph_data' => 'groups#import_graph_data'

  #Un-QC
  put '/groups/:group_id/annotations/:id/unapprove' => 'annotations#unapprove'

  #File Notes
  resources :file_notes, path: '/documents/:document_id/file_notes'


  resources :documents do

    #Groups
    resources :groups do
      post :clone
      post :update_approval
    end

    resources :annotations do
      member {  match '(*all)', action: :cors_options, via: :options, allowed_methods: [:delete,:post] }
    end
    resource :annotation do
      match '(*all)', action: :cors_options, via: :options, allowed_methods: [:get,:post]
    end
    collection do
      get :status
      get :loader
      get :queue_length
      get :preview
      get :published
      get :entity
      get :unpublished
      get :entities
      get :dates
      get :occurrence
    end
    member do
      post :upload_insert_document
      post :reprocess_text
      post :remove_pages
      get  :search
      get  :per_page_note_counts
      post :redact_pages
      get  :mentions
      post :reorder_pages
      post :save_page_text
      get  :preview
      get  'pages/:page_name.txt', :action=>:send_page_text
      post 'pages/:page_name.txt', :action=>:set_page_text
      get  'pages/:page_name.gif', :action=>:send_page_image
      get  ':slug.pdf',            :action=>:send_pdf
      get  ':slug.txt',            :action=>:send_full_text
      get  ':slug.:format',        :action=>:send_original
    end
  end

  # # Print notes.
  get '/notes/print' => 'annotations#print', :as => :print_notes

  # Reviewers.
  resources :reviewers do
    collection {
      post :send_email
      get :preview_email
    }
  end

  # Bulk downloads.
  get '/download/*args.zip' => 'download#bulk_download', :as => :bulk_download

  # Accounts and account management.
  resources :accounts do
    collection {
      get :logged_in
      get :search_view_only
    }
    member {
      post :resend_welcome
    }
  end
  match '/accounts/enable/:key' => 'accounts#enable', :via=>[:get,:post], :as => :enable_account
  match '/reset_password' => 'accounts#reset', :via=>[:get,:post], :as => :reset_password

  # Organizations management
  resources :organizations, :only=>:update

  # Projects.
  resources :projects do
    member {
      post :add_documents
      post :remove_documents
      get :documents
    }
    resources :collaborators, :only=>[:create,:destroy]
  end

  #Templates
  get '/templates/index.json' => 'templates#index'
  get '/templates/search' => 'templates#search'
  put '/templates/:template_id/template_fields' => 'template_fields#bulk_update'
  resources :templates do
    resources :template_fields
    resources :subtemplates
  end

  #Repos
  get '/repositories/index.json' => 'repositories#index'
  resources :repositories

  #Subtemplate fields
  resources :subtemplate_fields, path: '/subtemplates/:subtemplate_id/subtemplate_fields'

  # Home pages.
  get '/contributors' => 'home#contributors', :as => :contributors
  get '/faq' => 'home#faq'
  get '/terms' => 'home#terms', :as => :terms
  get '/privacy' => 'home#privacy', :as => :privacy
  get '/p3p.:format' => 'home#p3p', :as => :p3p
  get '/home' => 'home#index', :as => :home
  get '/news' => 'home#news', :as => :news
  get '/opensource' => 'home#opensource', :as => :opensource
  get '/about' => 'home#about', :as => :about
  get '/contact' => 'home#contact', :as => :contact
  get '/help' => 'home#help'
  get '/help/:page' => 'home#help'
  get '/multilanguage' => 'home#multilanguage', :as => :multilanguage

  # Redirects.
  get '/faq.php' => 'redirect#index', :url => '/faq'
  get '/who.php' => 'redirect#index', :as => :who, :url => '/about'
  get '/who-we-are' => 'redirect#index', :as => :who_we_are, :url => '/about'
  get '/partner.php' => 'redirect#index', :as => :partner, :url => '/contributors'
  get '/clips.php' => 'redirect#index', :as => :clips, :url => '/news'
  get '/blog/feed' => 'redirect#index', :as => :feed, :url => 'http://blog.documentcloud.org/feed'
  get '/feed' => 'redirect#index', :as => :root_feed, :url => 'http://blog.documentcloud.org/feed'
  get '/blog/*parts' => 'redirect#index', :as => :blog, :url => 'http://blog.documentcloud.org/'

  get '/admin' => 'admin#index'
  
  # Standard fallback routes
  match '/:controller(/:action(/:id))', :via=>[:get,:post]
  get ':controller/:action.:format' => '#index'

end
