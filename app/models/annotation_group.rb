class AnnotationGroup < ActiveRecord::Base
  belongs_to :group
  belongs_to :annotation

  has_many :approvals, :class_name => 'AnnotationGroup', :foreign_key => 'based_on'
  has_one :annotation_note, :foreign_key => 'annotation_group_id'
  has_one :supp_de_note, -> { where("(annotation_notes.annotation_group_id IS NOT NULL)") },
          :class_name => "AnnotationNote", :foreign_key => :de_ref

  before_destroy {
    #If based on something, decrement that relationship's annotation count
    if based_on
      ag = AnnotationGroup.where(id: based_on).first
      ag.update_attributes({approved_count: ag.approved_count - 1}) if !ag.nil?
    end
  }

  after_destroy {
    #Destroy annotation as well if no other groups link to it
    if !AnnotationGroup.exists?({annotation_id: self.annotation_id})
      Annotation.destroy_all({id: self.annotation_id})
    end
  }


  def qa_reject_note()
    return annotation_note.note if !annotation_note.nil?
    return supp_de_note.note if !supp_de_note.nil?
  end


  #Return stripped-down json indicating group and approval count
  def approval_json(in_qa)
    json = {
        :group_id => group_id,
        :approved_count => !in_qa ? approved_count : (qa_approved_by ? 1 : 0)
    }
  end

  #Take in addressing marker and qa rejection note and set proper status
  #Not addressed + No note = Not addressed by QA
  #Addressed + No note = Approved
  #Addressed + Note = Rejected
  def update_qa_status(addressed, note, account_id, doc_id)
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
            :document_id         => doc_id,
            :annotation_group_id => self.id,
            :note                => note,
            :addressed           => false,
            :iteration           => self.iteration
        })
      end
    else
      #If note exists, destroy it
      annotation_note.destroy if !annotation_note.nil?
    end

  end

end
