#In console: load 'create_users.rb'
organization = Organization.find_or_create_by(id: 1)

account = Account.find_or_create_by(email: "de1@denney.ws")
account.first_name = "DE"
account.last_name = "One"
account.language = account.document_language = 'eng'
account.hashed_password = BCrypt::Password.create( "de_one" )
account.save!
organization.add_member( account, Account::DATA_ENTRY )

account = Account.find_or_create_by(email: "qc@denney.ws")
account.first_name = "QC"
account.last_name = "One"
account.language = account.document_language = 'eng'
account.hashed_password = BCrypt::Password.create( "qc_one" )
account.save!
organization.add_member( account, Account::QUALITY_CONTROL )

account = Account.find_or_create_by(email: "qa@denney.ws")
account.first_name = "QA"
account.last_name = "One"
account.language = account.document_language = 'eng'
account.hashed_password = BCrypt::Password.create( "qa_one" )
account.save!
organization.add_member( account, Account::QUALITY_ASSURANCE )

account = Account.find_or_create_by(email: "extract@denney.ws")
account.first_name = "Data"
account.last_name = "Extractor"
account.language = account.document_language = 'eng'
account.hashed_password = BCrypt::Password.create( "extract" )
account.save!
organization.add_member( account, Account::DATA_EXTRACTION )

account = Account.find_or_create_by(email: "upload@denney.ws")
account.first_name = "File"
account.last_name = "Uploader"
account.language = account.document_language = 'eng'
account.hashed_password = BCrypt::Password.create( "upload" )
account.save!
organization.add_member( account, Account::FILE_UPLOADING )

quit