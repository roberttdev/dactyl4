class Group < ActiveRecord::Base
  belongs_to :parent, :class_name => 'Group', :foreign_key => 'parent_id'
  has_many :children, :class_name => 'Group', :foreign_key => 'parent_id', :dependent => :destroy
  belongs_to :group_template, :foreign_key => 'template_id'

  has_many :annotation_groups, :dependent => :destroy
  has_many :annotations, :through => :annotation_groups

  before_destroy :unapprove_annotations, :prepend => true

  def attributes
    super.merge('unapproved_count' => nil)
  end


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


  #Get count of unapproved points in this and child groups for this group's doc status
  def unapproved_count
    doc = Document.find(document_id)
    approvedField = ""
    approvedField = "qc_approved" if doc.in_qc?
    approvedField = "qa_approved" if doc.in_qa?

    if approvedField != ""
      sqlID = ActiveRecord::Base.connection.quote(id)
      sql = "SELECT anno.id
            FROM get_descendants(#{sqlID}) grps
            INNER JOIN annotation_groups ag ON grps.group_id=ag.group_id
            INNER JOIN annotations anno ON ag.annotation_id=anno.id
            WHERE anno.#{approvedField} IS NOT FALSE"
      annos = ActiveRecord::Base.connection.exec_query(sql)
      unapproved = annos.count
    else
      unapproved = 0
    end
  end


  def as_json(options = {})
    json = super(options)

    if(options[:ancestry])
      json[:ancestry] = get_ancestry
    end

    json
  end


  #Clone override.. 'is_sub' determines if this is a sub-process of the original clone;
  # 'related' indicates whether to include related objects (children and annotations)
  def clone(parent_id, is_sub, related)
    cloned = Group.create({
        :document_id => document_id,
        :parent_id => parent_id,
        :template_id => template_id,
        :name => is_sub ? name : "#{name} (copy)",
        :extension => extension
    })

    if related
      annotations.each do |anno|
        newAnno = Annotation.create({
          :account_id => anno.account_id,
          :document_id => anno.document_id,
          :title => anno.title,
          :templated => anno.templated
        })

        AnnotationGroup.create({
           :annotation_id => newAnno.id,
           :group_id => cloned.id
        })
      end

      children.each do |child|
        child.clone(cloned.id, true)
      end
    end

    cloned
  end

  #Remove approval if in status dealing with approvals
  def unapprove_annotations
    doc = Document.find(document_id)
    annotations.update_all({qc_approved: false}) if doc.in_qc?
    annotations.update_all({qa_approved: false}) if doc.in_qa?
  end
end
