class GroupTemplate < ActiveRecord::Base
  has_many :template_fields, :foreign_key => 'template_id', :dependent => :delete_all
  has_many :subtemplates, -> { order(sub_name: :asc) }, :foreign_key => 'template_id', :dependent => :delete_all
  has_many :groups, :foreign_key => 'template_id'

  #Get count of templates or subtemplates whose name match search term
  scope :matching_name, -> (search_term) {
      search_term = ActiveRecord::Base.connection.quote(search_term)
      sql = "SELECT name FROM group_templates
            WHERE name ILIKE #{search_term}
            UNION
            SELECT sub_name AS name FROM subtemplates
            WHERE sub_name ILIKE #{search_term}
            ORDER BY name LIMIT 10"
      find_by_sql(sql).map(&:name)
  }
end
