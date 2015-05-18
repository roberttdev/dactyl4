module DC

  # Mapping of document statuses to integers, for efficient storage/querying.
  module DocumentStatus

    STATUS_NEW = 1
    STATUS_DE1 = 2
    STATUS_DE2 = 3
    STATUS_READY_QC = 4
    STATUS_IN_QC = 5
    STATUS_READY_QA = 6
    STATUS_IN_QA = 7
    STATUS_READY_EXT = 8
    STATUS_READY_SUPP_DE = 9
    STATUS_IN_SUPP_DE = 10
    STATUS_READY_SUPP_QC = 11
    STATUS_IN_SUPP_QC = 12
    STATUS_READY_SUPP_QA = 13
    STATUS_IN_SUPP_QA = 14

    STATUS_MAP = {
        :status_new       => STATUS_NEW,
        :status_de1       => STATUS_DE1,
        :status_de2       => STATUS_DE2,
        :status_ready_qc  => STATUS_READY_QC,
        :status_in_qc     => STATUS_IN_QC,
        :status_ready_qa  => STATUS_READY_QA,
        :status_in_qa     => STATUS_IN_QA,
        :status_ready_ext => STATUS_READY_EXT,
        :status_ready_supp_de   => STATUS_READY_SUPP_DE,
        :status_in_supp_de      => STATUS_IN_SUPP_DE,
        :status_ready_supp_qc   => STATUS_READY_SUPP_QC,
        :status_in_supp_qc      => STATUS_IN_SUPP_QC,
        :status_ready_supp_qa   => STATUS_READY_SUPP_QA,
        :status_in_supp_qa      => STATUS_IN_SUPP_QA
    }

    STATUS_TEXT = {
      'New'                         => 1,
      'In Data Entry (1 Claim)'     => 2,
      'In Data Entry (2 Claims)'    => 3,
      'Ready for Quality Control'   => 4,
      'In Quality Control'          => 5,
      'Ready for Quality Assurance' => 6,
      'In Quality Assurance'        => 7,
      'Ready for Extraction'        => 8,
      'Ready for Supplemental Data Entry' => 9,
      'In Supplemental Data Entry' => 10,
      'Ready for Supplemental Quality Control' => 11,
      'In Supplemental Quality Control' => 12,
      'Ready for Supplemental Quality Assurance' => 13,
      'In Supplemental Quality Assurance' => 14
    }

    #Which statuses are accessible to which roles
    DE_ACCESS = [STATUS_NEW, STATUS_DE1, STATUS_READY_SUPP_DE]
    QC_ACCESS = [STATUS_NEW, STATUS_DE1, STATUS_READY_QC, STATUS_READY_SUPP_DE, STATUS_READY_SUPP_QC]
    QA_ACCESS = [STATUS_NEW, STATUS_DE1, STATUS_READY_QC, STATUS_READY_QA, STATUS_READY_SUPP_DE, STATUS_READY_SUPP_QC, STATUS_READY_SUPP_QA]
    EXTRACT_ACCESS = [STATUS_READY_EXT]

    #Which statuses allow claims
    CLAIMABLE_STATUS = [STATUS_NEW, STATUS_DE1, STATUS_READY_QC, STATUS_READY_QA, STATUS_READY_EXT, STATUS_READY_SUPP_DE, STATUS_READY_SUPP_QC, STATUS_READY_SUPP_QA]

    #Returns what the status will be when the current status is claimed
    def claimed_status(current)
      case current
        when STATUS_NEW, STATUS_DE1, STATUS_READY_QC, STATUS_READY_QA, STATUS_READY_SUPP_DE, STATUS_READY_SUPP_QC, STATUS_READY_SUPP_QA
          return current+1
        else
          return nil
      end
    end

  end

end
