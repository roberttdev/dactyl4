# An Account on DocumentCloud can be used to access the workspace and upload
# documents. Accounts have full priviledges for the entire organization, at the
# moment.

class Account < ActiveRecord::Base
  include DC::Access
  include DC::Roles
  include DC::DocumentStatus

  # Associations:
  has_many :memberships,     :dependent => :destroy
  has_many :organizations,   :through => :memberships
  has_many :projects,        :dependent => :destroy
  has_many :annotations
  has_many :collaborations,  :dependent => :destroy
  has_many :processing_jobs, :dependent => :destroy
  has_one  :security_key,    :dependent => :destroy, :as => :securable
  has_many :shared_projects, :through => :collaborations, :source => :project
  has_many :documents
  has_many :view_only_accesses

  # Validations:
  validates  :first_name, :last_name, :presence=>true
  validates  :email,
    :presence   =>true,
    :uniqueness =>{ :case_sensitive => false },
    :format     =>{ :with => DC::Validators::EMAIL },
    :if         => :has_memberships?

  validate :validate_identity_is_unique
  validates :language, :inclusion=>{ :in => DC::Language::USER,
            :message => "must be one of: (#{DC::Language::USER.join(', ')})" }
  validates :document_language,  :inclusion=>{ :in => DC::Language::SUPPORTED,
            :message => "must be one of: (#{DC::Language::SUPPORTED.join(', ')})" }

  # Sanitizations:
  text_attr :first_name, :last_name, :email

  # Delegations:
  delegate :name, :to => :organization, :prefix => true, :allow_nil => true

  # Scopes
  scope :with_memberships, -> { references(:memberships).includes(:memberships) }
  scope :admin,   -> { with_memberships.where( ["memberships.role = ?",  ADMINISTRATOR] )  }
  scope :active,  -> { with_memberships.where( ["accounts.disabled IS NULL OR accounts.disabled<>TRUE"] ) }
  scope :real,    -> { with_memberships.where( ["memberships.role in (?)", REAL_ROLES] ) }
  scope :with_identity, lambda { | provider, id |
     where("identities @> hstore(:provider, :id)", :provider=>provider.to_s,:id=>id.to_s )
  }
  scope :by_name, ->(first_name, last_name) { where({:first_name => first_name, :last_name => last_name})}

  # Populates the organization#members accessor with all the organizaton's accounts
  def organizations_with_accounts
    Organization.populate_members_info( self.organizations, self )
  end

  # Attempt to log in with an email address and password.
  def self.log_in(email, password, session=nil, cookies=nil)
    account = Account.lookup(email)
    return false unless account && account.password == password
    account.authenticate(session, cookies) if session && cookies
    account
  end

  #Attempt login with an ID and hashed password
  def self.hashed_login(id, hashed_pw, session=nil, cookies=nil)
    account = Account.find_by_id(id)
    return false if !account || account.password.bytes.pack("C*") != hashed_pw
    account.authenticate(session, cookies) if session && cookies
    account
  end

  # Retrieve the names of the contributors for the result set of documents.
  def self.names_for_documents(docs)
    ids = docs.map {|doc| doc.account_id }.uniq
    self.where({:id => ids}).select('id, first_name, last_name').inject({}) do |hash, acc| 
      hash[acc.id] = acc.full_name; hash
    end
  end

  def self.lookup(email)
    Account.where(['lower(email) = ?', email.downcase]).first
  end

  #
  def self.from_identity( identity )

    unless account = Account.with_identity( identity['provider'],  identity['uid'] ).first
      account = Account.new({ :document_language=>'eng', :language=>'eng' })
    end

    account.record_identity_attributes( identity )
    account.save! if account.changed?
    account
  end

  # Save this account as the current account in the session. Logs a visitor in.
  def authenticate(session, cookies)
    session['account_id']      = id
    session['organization_id'] = organization_id
    refresh_credentials(cookies)
    self
  end

  # Reset the logged-in cookie.
  def refresh_credentials(cookies)
    cookies['dc_logged_in'] = {:value => 'true', :expires => 1.month.from_now, :httponly => true}
  end

  def self.make_slug(account)
    first = account['first_name'] && account['first_name'].downcase.gsub(/\W/, '')
    last  = account['last_name'] && account['last_name'].downcase.gsub(/\W/, '')
    "#{account['id']}-#{first}-#{last}"
  end

  def slug
    @slug ||= Account.make_slug(self)
  end

  # Shims to preserve API backwards compatability.
  def organization
    @organization ||= Organization.default_for(self)
  end

  def organization_id
    return nil unless self.organization
    self.organization.id
  end

  def role
    default = memberships.where({:default=>true}).first
    default.nil? ? nil : default.role
  end

  def member_of?(org)
    self.memberships.exists?(:organization_id => org.id)
  end

  def has_memberships? # should be reworked as Account#real?
    self.memberships.any?
  end

  def has_role?(role, org=nil)
    if org.nil?
      self.memberships.exists?(:role => role)
    else
      self.memberships.exists?(:role => role, :organization_id => org.id)
    end
  end

  def can_extract?()
    has_role?(ADMINISTRATOR) || has_role?(DATA_EXTRACTION)
  end

  def admin?(org=self.organization)
    has_role?(ADMINISTRATOR, org)
  end

  def data_entry?(org=self.organization)
    has_role?(DATA_ENTRY, org)
  end

  def quality_control?(org=self.organization)
    has_role?(QUALITY_CONTROL, org)
  end

  def quality_assurance?(org=self.organization)
    has_role?(QUALITY_ASSURANCE, org)
  end

  def file_uploading?(org=self.organization)
    has_role?(FILE_UPLOADING, org)
  end

  def data_extraction?(org=self.organization)
    has_role?(DATA_EXTRACTION, org)
  end

  def view_only?(org=self.organization)
    has_role?(VIEW_ONLY, org)
  end

  def disabled?(org=self.organization)
    self.disabled
  end

  def active?(org=self.organization)
    membership = self.memberships.where({:organization_id => org}).first
    membership && !self.disabled
  end

  #Checks whether user has claims for docs in the status being requested.  Optional, exclude a doc ID
  def has_claims?(status, excludeId=nil)
    where = []
    where << "id<>#{excludeId}" if excludeId

    case status
      when STATUS_DE1, STATUS_DE2, STATUS_IN_SUPP_DE
        where << "(status=#{STATUS_DE1} OR status=#{STATUS_DE2} OR status=#{STATUS_IN_SUPP_DE})
                  AND ((de_one_id=#{self.id} AND de_one_complete IS NOT true) OR (de_two_id=#{self.id} AND de_two_complete IS NOT true))"
      when STATUS_IN_QC, STATUS_IN_SUPP_QC
        where << "(status=#{STATUS_IN_QC} OR status=#{STATUS_IN_SUPP_QC}) AND qc_id=#{self.id}"
      when STATUS_IN_QA, STATUS_IN_SUPP_QA
        where << "(status=#{STATUS_IN_QA} OR status=#{STATUS_IN_SUPP_QA}) AND qa_id=#{self.id}"
      else
        return false
    end

    Document.where(where.join(' AND ')).count > 1
  end

  # An account owns a resource if it's tagged with the account_id.
  def owns?(resource)
    resource.account_id == id
  end

  def allowed_to_edit_account?(account, org=self.organization)
    (self.id == account.id) ||
    ((self.admin?(org) && account.member_of?(org)) || (self.member_of?(org)))
  end

  # is the account considered an DocumentCloud Administrator?
  def dcloud_admin?
    organization.id == 1
  end

  # When an account is created by a third party, send an email with a secure
  # key to set the password.
  def send_login_instructions(admin=nil)
    ensure_security_key!
    LifecycleMailer.login_instructions(self, admin).deliver
  end

  def ensure_security_key!
    create_security_key if security_key.nil?
  end

  # When a password reset request is made, send an email with a secure key to
  # reset the password.
  def send_reset_request
    ensure_security_key!
    LifecycleMailer.reset_request(self).deliver
  end

  # No middle names, for now.
  def full_name
    "#{first_name} #{last_name}"
  end

  # The ISO 8601-formatted email address.
  def rfc_email
    "\"#{full_name}\" <#{email}>"
  end

  # Has this account been assigned, but never logged into, with no password set?
  def pending?
    !hashed_password && identities.blank?
  end

  # It's slo-o-o-w to compare passwords. Which is a mixed bag, but mostly good.
  def password
    return false if hashed_password.nil?
    @password ||= BCrypt::Password.new(hashed_password)
  end

  # BCrypt'd passwords helpfully have the salt built-in.
  def password=(new_password)
    @password = BCrypt::Password.create(new_password, :cost => 8)
    self.hashed_password = @password
  end

  def validate_identity_is_unique
    return if self.identities.blank?
    condition = self.identities.map{ | provider, id | "identities @> hstore(?,?)" }.join(' or ')
    condition << " and id<>#{self.id}" unless new_record?
    values = self.identities.map{|k,v| [k.to_s,v.to_s] }.flatten
    if account = Account.where( [ condition, *values ] ).first
      duplicated = account.identities.to_set.intersection( self.identities ).map{|k,v| k}.join(',')
      errors.add(:identities, "An account exists with the same id for #{account.id} #{account.identities.to_json} #{duplicated}")
    end
  end

  def record_identity_attributes( identity )
    current_identities = ( self.identities ||= {} )
    current_identities[ identity['provider'] ] = identity['uid']
    write_attribute( :identities, DC::Hstore.to_sql(  current_identities ) )

    info = identity['info']

    # only overwrite account's email if it is blank no-one else is using it
    self.email = info['email'] if info['email'] && self.email.blank? && Account.lookup( info['email'] ).nil?

    %w{ first_name last_name }.each do | attr |
      write_attribute( attr, info[attr] ) if read_attribute(attr).blank? && info[attr]
    end
    if self.first_name.blank? && ! info['name'].blank?
      self.first_name = info['name'].split(' ').first
    end
    if self.last_name.blank? && ! info['name'].blank?
      self.last_name = info['name'].split(' ').last
    end

    self
  end

  # Create default organization to preserve backwards compatability.
  def canonical(options = {})
    attrs = {
      'id'                => id,
      'slug'              => slug,
      'email'             => email,
      'first_name'        => first_name,
      'last_name'         => last_name,
      'language'          => language,
      'document_language' => document_language,
      'pending'           => pending?,
      'disabled'          => disabled
    }

    if options[:include_memberships]
      attrs['memberships'] = memberships.map{ |m| m.canonical(options) }
    end
    if options[:include_document_counts]
      attrs['public_documents'] = Document.unrestricted.where(:account_id=>id).count
      attrs['private_documents'] = Document.restricted.where(:account_id => id).count
    end
    
    # all of the below should be rendered obsolete and removed.
    if ( membership = options[:membership] || memberships.default.first )
      attrs['organization_id'] = membership.organization_id
      attrs['role']            = membership.role
    end
    if options[:include_organization]
      attrs['organization_name'] = membership.organization.name if membership
      attrs['organizations']     = organizations.map(&:canonical)
    end
    
    attrs
  end

  # The JSON representation of an account avoids sending down the password,
  # among other things, and includes extra attributes.
  def as_json(options={})
    canonical(options)
  end

end
