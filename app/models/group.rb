class Group < ActiveRecord::Base
  belongs_to :parent, :class_name => 'Group', :foreign_key => 'parent_id'
  has_many :children, :class_name => 'Group', :foreign_key => 'parent_id', :dependent => :delete_all
  belongs_to :group_template, :foreign_key => 'template_id'
  has_many :annotations, :dependent => :delete_all


  #Get ordered ancestry array for record
  def get_ancestry
    sql = "SELECT * FROM get_ancestry(#{id})"
    ancestry = ActiveRecord::Base.connection.exec_query(sql)
    order_ancestry(ancestry.to_hash)
  end


  #Order ancestry from left-to-right, root-to-child.
  def order_ancestry(anc_hash)
    ordered = []
    next_parent = nil
    for i in 1..anc_hash.length
      split = anc_hash.partition{|grp| grp['parent_id'] == next_parent}
      ordered << split[0][0]
      next_parent = split[0][0]['id']
      anc_hash = split[1]
    end
    ordered
  end


  def as_json(options = {})
    json = super(options)
    if(options[:ancestry])
      json[:ancestry] = get_ancestry
    end
    json
  end
end
