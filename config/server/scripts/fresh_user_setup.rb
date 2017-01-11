organization = Organization.find_or_create_by(id: 1)
organization.slug = "dactyl"
organization.name = "DACTYL"
organization.language = organization.document_language = 'eng'
organization.save!
account = Account.find_or_create_by(email: "admin@denney.ws")
account.first_name = "Bill"
account.last_name = "Denney"
account.language = account.document_language = 'eng'
account.hashed_password = BCrypt::Password.create( "this_dactyl_default_pw" )
account.save!
organization.add_member( account, Account::ADMINISTRATOR )