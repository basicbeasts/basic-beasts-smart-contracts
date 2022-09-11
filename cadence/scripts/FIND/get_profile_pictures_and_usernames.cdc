import Profile from 0xProfile

        pub fun main(addresses: [Address]) : {Address: Profile.UserProfile} {
            var profiles: {Address: Profile.UserProfile} = {}
            for address in addresses {
                let user = getAccount(address)
                    .getCapability<&{Profile.Public}>(Profile.publicPath)
                    .borrow()?.asProfile()
                if (user != nil) {
                    profiles[user.address!] = user
                }
            }
            return profiles
        }
        