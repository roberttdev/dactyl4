module DC
  module Roles

    DISABLED          = 0
    ADMINISTRATOR     = 1
    CONTRIBUTOR       = 2 # DC LEGACY - Unused
    REVIEWER          = 3 # DC LEGACY - Unused
    FREELANCER        = 4 # DC LEGACY - Unused
    DATA_ENTRY        = 5
    QUALITY_CONTROL   = 6
    QUALITY_ASSURANCE = 7
    FILE_UPLOADING    = 8
    DATA_EXTRACTION   = 9
    VIEW_ONLY         = 10

    ROLE_MAP = {
      :disabled           => DISABLED,
      :administrator      => ADMINISTRATOR,
      :admin              => ADMINISTRATOR,
      :contributor        => CONTRIBUTOR, # DC LEGACY - Unused
      :reviewer           => REVIEWER, # DC LEGACY - Unused
      :freelancer         => FREELANCER, # DC LEGACY - Unused
      :data_entry         => DATA_ENTRY,
      :quality_control    => QUALITY_CONTROL,
      :quality_assurance  => QUALITY_ASSURANCE,
      :file_uploading     => FILE_UPLOADING,
      :data_extraction    => DATA_EXTRACTION,
      :view_only          => VIEW_ONLY
    }
    ROLE_NAMES = ROLE_MAP.invert
    ROLES      = ROLE_NAMES.keys
    REAL_ROLES = [ADMINISTRATOR, DATA_ENTRY, QUALITY_CONTROL, QUALITY_ASSURANCE, FILE_UPLOADING, DATA_EXTRACTION, VIEW_ONLY, DISABLED]
  end
end
