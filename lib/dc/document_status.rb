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
        :status_in_supp_qc      => STATUS_IN_SUPP_QC
    }

    #Which statuses are accessible to which roles
    DE_ACCESS = [STATUS_NEW, STATUS_DE1, STATUS_READY_SUPP_DE]
    QC_ACCESS = [STATUS_NEW, STATUS_DE1, STATUS_READY_QC, STATUS_READY_SUPP_DE, STATUS_READY_SUPP_QC]
    QA_ACCESS = [STATUS_NEW, STATUS_DE1, STATUS_READY_QC, STATUS_READY_QA, STATUS_READY_SUPP_DE, STATUS_READY_SUPP_QC]
    EXTRACT_ACCESS = [STATUS_READY_EXT]

    #Which statuses allow claims
    CLAIMABLE_STATUS = [STATUS_NEW, STATUS_DE1, STATUS_READY_QC, STATUS_READY_QA, STATUS_READY_SUPP_DE, STATUS_READY_SUPP_QC]

    #Returns what the status will be when the current status is claimed
    def claimed_status(current)
      case current
        when STATUS_NEW, STATUS_DE1, STATUS_READY_QC, STATUS_READY_QA, STATUS_READY_SUPP_DE, STATUS_READY_SUPP_QC
          return current+1
        else
          return nil
      end
    end

  end

end
