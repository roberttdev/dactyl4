class Group < ActiveRecord::Base
    belongs_to :parent, :class_name => 'Group', :foreign_key => 'parent_id'
    has_many :children, -> { includes :annotation_note }, :class_name => 'Group', :foreign_key => 'parent_id', :dependent => :destroy

    has_many :supp_qc_children, -> { where("id NOT IN (SELECT group_id FROM annotation_notes an WHERE an.document_id=groups.document_id AND group_id IS NOT NULL)
            AND (groups.iteration <> (SELECT iteration FROM documents WHERE id=groups.document_id)
              OR groups.account_id=(SELECT qc_id FROM documents WHERE id=groups.document_id))") },
           :class_name => "Group", :foreign_key => 'parent_id'

    has_many :supp_qc_de1_children, -> { includes(:annotation_note).where("(groups.iteration <> (SELECT iteration FROM documents WHERE id=groups.document_id))") },
           :class_name => "Group", :foreign_key => 'parent_id'

    has_many :supp_qc_de2_children, -> { where("id NOT IN (SELECT de_ref FROM annotation_notes an WHERE an.document_id=groups.document_id AND group_id IS NOT NULL)") },
           :class_name => "Group", :foreign_key => 'parent_id'

    has_many :supp_qa_children, -> { where("((groups.iteration <> (SELECT iteration FROM documents WHERE id=groups.document_id)
              AND NOT EXISTS (SELECT * FROM annotation_notes WHERE document_id=groups.document_id AND groups.id=annotation_notes.group_id))
              OR groups.iteration = (SELECT iteration FROM documents WHERE id=groups.document_id))") },
           :class_name => "Group", :foreign_key => 'parent_id'

    belongs_to :group_template, :foreign_key => 'template_id'
    belongs_to :document

    has_one :graph, :dependent => :destroy

    has_many :annotations, :dependent => :destroy

    has_one :annotation_note
    has_one :supp_de_note, -> { where("(annotation_notes.group_id IS NOT NULL)") },
          :class_name => "AnnotationNote", :foreign_key => :de_ref

    #Base group for document/user
    scope :base, ->(doc, account_id=nil, de=nil, qc=nil) {
        whereClause = {
            :document_id => doc.id,
            :base => true
        }

        if doc.in_de? || doc.in_supp_de?
            accountId = account_id
        elsif doc.in_qc?
            accountId = doc.de_one_id if de == "1"
            accountId = doc.de_two_id if de == "2"
            accountId = doc.qc_id if qc == "true"
            accountId = account_id if accountId.nil?
        elsif doc.in_qa? || doc.in_extraction? || doc.in_supp_qa?
            accountId = doc.qc_id
        elsif doc.in_supp_qc?
            if de == "2"
                whereClause[:iteration] = doc.iteration
            else
                whereClause[:canon] = true
            end
        end

        whereClause[:account_id] = accountId if !accountId.nil?

        where(whereClause).order(created_at: :desc).first
    }


    def attributes
        merge_hash = {
            'is_graph_group' => nil,
            'graph_id' => nil,
            'highlight_id' => nil,
            'based_on' => nil
        }
        if document.in_qa? || document.in_supp_qa? || document.in_supp_de? || document.in_supp_qc?
            merge_hash['approved'] = nil
            merge_hash['qa_reject_note'] = nil
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


    def is_graph_group
        return self.graph ? true : false
    end

    def graph_id
        if self.graph
            return self.graph.id
        elsif is_graph_data
            return self.parent.graph.id
        end
    end

    def highlight_id
        if self.graph
            return self.graph.highlight_id
        elsif is_graph_data
            return self.parent.graph.highlight_id
        end
        return self.graph ? self.graph.highlight_id : nil
    end

    def based_on
        return self.graph ? self.graph.based_on : nil
    end

    def approved
        qa_approved_by ? true : false
    end


    def qa_reject_note
        return annotation_note.note if !annotation_note.nil?
        return supp_de_note.note if !supp_de_note.nil?
    end


    #Get count of unapproved points in this and child groups for this group's doc status
    def unapproved_count
        if document.in_qc? || document.in_supp_qc?
            sqlID = ActiveRecord::Base.connection.quote(id)
            sql = "SELECT a.id
                FROM get_descendants(#{sqlID}) grps
                INNER JOIN annotations a ON grps.group_id=a.group_id
                LEFT JOIN annotations qc ON qc.based_on=a.id
                WHERE qc.id IS NULL AND a.qa_approved_by IS NULL"
            annos = ActiveRecord::Base.connection.exec_query(sql)
            unapproved = annos.count
        elsif document.in_qa? || document.in_supp_qa?
            sqlID = ActiveRecord::Base.connection.quote(id)
            sql = "SELECT a.id
                FROM get_descendants(#{sqlID}) grps
                INNER JOIN annotations a ON grps.group_id=a.group_id
                WHERE a.qa_approved_by IS NULL"
            annos = ActiveRecord::Base.connection.exec_query(sql)
            unapproved = annos.count
        else
            unapproved = 0
        end
    end


    def as_json(options = {})
        json = super(options)

        if options[:ancestry]
            json[:ancestry] = get_ancestry
        end

        #If special filtered children are requested, reframe as children
        if !options[:include].nil?
            if options[:include].include?(:supp_qc_children)
                json[:children] = json['supp_qc_children']
                json.delete(:supp_qc_children)
            elsif options[:include].include?(:supp_qc_de1_children)
                json[:children] = json['supp_qc_de1_children']
                json.delete(:supp_qc_de1_children)
            elsif options[:include].include?(:supp_qc_de2_children)
                json[:children] = json['supp_qc_de2_children']
                json.delete(:supp_qc_de2_children)
            elsif options[:include].include?(:supp_qa_children)
                json[:children] = json['supp_qa_children']
                json.delete(:supp_qa_children)
            end
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
    # 'keep_values' keep anno-group values, notes and approval status if true; null if not
    # 'graph_only' only copy graph-related anno/groups
    # 'as_graph' treat result as graph (vs. vanilla grp/annos)
    def clone(parent_id, account_id, is_sub, related, iteration, same_name, keep_values, graph_only)
        cloned = Group.create({
            :account_id => account_id,
            :base => base,
            :canon => false,
            :document_id => document_id,
            :extension => is_sub || same_name ? extension : 'COPY',
            :is_graph_data => is_graph_data,
            :iteration => iteration,
            :name => name,
            :parent_id => parent_id,
            :qa_approved_by => keep_values ? qa_approved_by : nil,
            :template_id => template_id
        })

        if keep_values && annotation_note
            annotation_note.update({ :de_ref => cloned.id })
        end

        if related
            if keep_values
                if graph_only
                    annos = annotations.where({:is_graph_data => true})
                else
                    annos = annotations
                end

                annos.each do |a|
                    cloned_a = Annotation.create({
                        :account_id => account_id,
                        :based_on => document.in_qc? ? a.id : based_on,
                        :content => a.content,
                        :created_by => a.created_by,
                        :document_id => a.document_id,
                        :group_id => cloned.id,
                        :highlight_id => a.highlight_id,
                        :is_graph_data => a.is_graph_data,
                        :iteration => iteration,
                        :qa_approved_by => a.qa_approved_by,
                        :templated => a.templated,
                        :title => a.title
                    })

                    if a.annotation_note
                        a.annotation_note.update({ :de_ref => cloned_a.id })
                    end
                end
            else
                annotations.each do |anno|
                    newAnno = Annotation.create({
                        :account_id => anno.account_id,
                        :created_by => anno.created_by,
                        :document_id => anno.document_id,
                        :group_id => cloned.id,
                        :is_graph_data => anno.is_graph_data,
                        :iteration => iteration,
                        :qa_approved_by => anno.qa_approved_by,
                        :templated => anno.templated,
                        :title => anno.title
                    })
                end
            end

            #Subgroups
            if graph_only
                child_grps = children.where({:is_graph_data => true})
            else
                child_grps = children
            end
            child_grps.each do |child|
                child.clone(cloned.id, account_id, true, related, iteration, same_name, keep_values, graph_only)
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
                    :addressed           => false,
                    :iteration           => self.iteration
                })
            end
        else
            #If note exists, destroy it
            annotation_note.destroy if !annotation_note.nil?
        end

        #If subitems need to be addressed as well, then do so
        if subitems_too
            self.annotations.each do |a|
                a.update_qa_status(addressed, note, account_id, self.document_id)
            end
            self.children.each do |child|
                child.update_qa_status(addressed, note, account_id, true)
            end
        end
    end
end
