module DC
  module Roles

    DISABLED          = 0
    ADMINISTRATOR     = 1
    CONTRIBUTOR       = 2
    REVIEWER          = 3
    FREELANCER        = 4
    DATA_ENTRY        = 5
    QUALITY_CONTROL   = 6
    QUALITY_ASSURANCE = 7
    FILE_UPLOADING    = 8
    DATA_EXTRACTION   = 9

    ROLE_MAP = {
      :disabled           => DISABLED,
      :administrator      => ADMINISTRATOR,
      :admin              => ADMINISTRATOR,
      :contributor        => CONTRIBUTOR,
      :reviewer           => REVIEWER,
      :freelancer         => FREELANCER,
      :data_entry         => DATA_ENTRY,
      :quality_control    => QUALITY_CONTROL,
      :quality_assurance  => QUALITY_ASSURANCE,
      :file_uploading     => FILE_UPLOADING,
      :data_extraction    => DATA_EXTRACTION
    }
    ROLE_NAMES = ROLE_MAP.invert
    ROLES      = ROLE_NAMES.keys
    REAL_ROLES = [ADMINISTRATOR, DATA_ENTRY, QUALITY_CONTROL, QUALITY_ASSURANCE, FILE_UPLOADING, DATA_EXTRACTION, DISABLED]
  end
end
