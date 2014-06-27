class Group < ActiveRecord::Base
  belongs_to :parent, :class_name => 'Group', :foreign_key => 'parent_id'
  has_many :children, :class_name => 'Group', :foreign_key => 'parent_id', :dependent => :destroy
  belongs_to :group_template, :foreign_key => 'template_id'

  has_many :annotation_groups, :dependent => :destroy
  has_many :annotations, :through => :annotation_groups

  #Get ordered ancestry array for record
  def get_ancestry
    sqlID = ActiveRecord::Base.connection.quote(id)
    ancestry = ActiveRecord::Base.connection.exec_query("SELECT * FROM get_ancestry(#{sqlID})")
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


  #Clone override.. 'is_sub' determines if this is a sub-process of the original clone
  def clone(parent_id, is_sub)
    cloned = Group.create({
        :document_id => document_id,
        :parent_id => parent_id,
        :template_id => template_id,
        :name => is_sub ? name : "#{name} (copy)"
    })

    annotations.each do |anno|
      Annotation.create({
        :account_id => anno.account_id,
        :document_id => anno.document_id,
        :group_id => cloned.id,
        :title => anno.title,
        :templated => anno.templated
      })
    end

    children.each do |child|
      child.clone(cloned.id, true)
    end

    cloned
  end
end
