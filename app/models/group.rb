class Group < ActiveRecord::Base
  belongs_to :parent, :class_name => 'Group', :foreign_key => 'parent_id'
  has_many :children, -> { includes :annotation_note }, :class_name => 'Group', :foreign_key => 'parent_id', :dependent => :destroy
  belongs_to :group_template, :foreign_key => 'template_id'
  belongs_to :document

  has_many :annotation_groups, :dependent => :destroy
  has_many :annotations, :through => :annotation_groups

  has_one :annotation_note

  #Base group for document/user
  scope :base, ->(doc, account_id=nil, de=nil, qc=nil) {
    if doc.in_de?
      accountId = account_id
    elsif doc.in_qc?
      accountId = doc.de_one_id if de == "1"
      accountId = doc.de_two_id if de == "2"
      accountId = doc.qc_id if qc == "true"
      accountId = account_id if accountId.nil?
    elsif doc.in_qa? || doc.in_extraction?
      accountId = doc.qc_id
    elsif doc.in_supp_de? || doc.in_supp_qc? || doc.in_supp_qa?
      accountId = doc.reviews.where({iteration: 1}).first.qc_id
    end

    where({
      :document_id => doc.id,
      :account_id => accountId,
      :base => true
    }).first
  }

  def attributes
    merge_hash = {}
    if document.in_qa? || document.in_supp_de?
      merge_hash = {
        'approved' => nil,
        'qa_reject_note' => nil
      }
    end

    merge_hash[:unapproved_count] = nil
    super.merge(merge_hash)
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

  def approved
    qa_approved_by ? true : false
  end

  def qa_reject_note
    !annotation_note.nil? ? annotation_note.note : nil
  end

  #Get count of unapproved points in this and child groups for this group's doc status
  def unapproved_count
    if document.in_qc?
      sqlID = ActiveRecord::Base.connection.quote(id)
      sql = "SELECT ag.id
            FROM get_descendants(#{sqlID}) grps
            INNER JOIN annotation_groups ag ON grps.group_id=ag.group_id
            WHERE ag.approved_count=0"
      annos = ActiveRecord::Base.connection.exec_query(sql)
      unapproved = annos.count
    elsif document.in_qa?
      sqlID = ActiveRecord::Base.connection.quote(id)
      sql = "SELECT ag.id
            FROM get_descendants(#{sqlID}) grps
            INNER JOIN annotation_groups ag ON grps.group_id=ag.group_id
            WHERE ag.qa_approved_by IS NULL"
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


  #Mark that the group was deleted in Supp DE.. can't fully delete it without removing ability to drop work
  def mark_deleted_in_supp
    self.update({:deleted_in_supp => true})
    self.annotation_groups.each do |ag|
      ag.mark_deleted_in_supp()
    end
  end

  #Clone override.. 'is_sub' determines if this is a sub-process of the original clone;
  # 'related' indicates whether to include related objects (children and annotations)
  # 'same_name' overrides the default behavior of adding '(copy)' to the name of the copy
  def clone(parent_id, account_id, is_sub, related, iteration, same_name)
    cloned = Group.create({
        :document_id => document_id,
        :parent_id => parent_id,
        :template_id => template_id,
        :account_id => account_id,
        :name => name,
        :extension => is_sub || same_name ? extension : 'COPY',
        :iteration => iteration
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
           :group_id => cloned.id,
           :iteration => iteration,
           :created_by => account_id,
           :approved_count => 0
        })
      end

      children.each do |child|
        child.clone(cloned.id, account_id, true, related, iteration, same_name)
      end
    end

    cloned
  end


  #Take in addressing marker and qa rejection note and set proper status
  #Not addressed + No note = Not addressed by QA
  #Addressed + No note = Approved
  #Addressed + Note = Rejected
  def update_qa_status(addressed, note, account_id, subitems_too)
    if addressed && !qa_approved_by
      #If approved and we haven't stored approved by, store it
      self.update_attributes({:qa_approved_by => account_id})
    elsif !addressed && qa_approved_by
      #If for some reason approval is revoked, remove id ref
      self.update_attributes({:qa_approved_by => nil})
    end

    #Add/update note if passed
    if note
      if !annotation_note.nil?
        #If exists and text has changed, update
        annotation_note.update_attributes({:note => note}) if annotation_note.note != note
      else
        #If not, add
        AnnotationNote.create({
            :document_id         => self.document_id,
            :group_id            => self.id,
            :note                => note,
            :addressed           => false
        })
      end
    else
      #If note exists, destroy it
      annotation_note.destroy if !annotation_note.nil?
    end

    #If subitems need to be addressed as well, then do so
    if subitems_too
      self.annotation_groups.each do |ag|
        ag.update_qa_status(addressed, note, account_id, self.document_id)
      end
      self.children.each do |child|
        child.update_qa_status(addressed, note, account_id, true)
      end
    end
  end
end
