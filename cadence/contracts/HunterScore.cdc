import BasicBeasts from "./BasicBeasts.cdc"

pub contract HunterScore {

    // -----------------------------------------------------------------------
    // Named Paths
    // -----------------------------------------------------------------------
    pub let AdminStoragePath: StoragePath
    pub let AdminPrivatePath: PrivatePath

    access(self) var hunterScores: {Address: UInt32}

    access(self) var beastsCollected: {Address: [UInt64]}

    access(self) var beastTemplatesCollected: {Address: [UInt32]}

    access(self) var banned: [Address]

    // String = skin + " " + starLevel.toString()
    // UInt32 = pointReward
    //
    access(self) var pointTable: {String: UInt32}


    //TODO deduct hunterscore points and ban and unban wallets using admin resource

    // -----------------------------------------------------------------------
    // Admin Resource Functions
    //
    // Admin is a special authorization resource that 
    // allows the owner to perform important NFT functions
    // -----------------------------------------------------------------------
    pub resource Admin {

        pub fun deductPoints(wallet: Address, pointsToDeduct: UInt32) {
            pre {
                HunterScore.hunterScores[wallet] != nil: "Can't deduct points: Address has no hunter score."
            }
            if(pointsToDeduct > HunterScore.hunterScores[wallet]!) {
                HunterScore.hunterScores.insert(key: wallet, 0)
            } else {
                HunterScore.hunterScores.insert(key: wallet, HunterScore.hunterScores[wallet]! - pointsToDeduct)
            }
        }

        pub fun banAddress(wallet: Address) {
            HunterScore.banned.append(wallet)
        }

        pub fun unbanAddress(wallet: Address) {
            if(HunterScore.banned.contains(wallet)) {
                var i = 0
                for address in HunterScore.banned {
                    if(address == wallet) {
                        HunterScore.banned.remove(at: i)
                    }
                    i = i + 1
                }
            }
        }

        pub fun createNewAdmin(): @Admin {
            return <-create Admin()
        }
    }

    access(account) fun increaseHunterScore(wallet: Address, beasts: @BasicBeasts.Collection): @BasicBeasts.Collection {
        if(!self.banned.contains(wallet)) {

            // Initialize arrays if wallet is not already in dictionaries
            if(HunterScore.beastsCollected[wallet] == nil) {
                HunterScore.beastsCollected[wallet] = []
            }
            if(HunterScore.beastTemplatesCollected[wallet] == nil) {
                HunterScore.beastTemplatesCollected[wallet] = []
            }

            // Calculate points
            var points: UInt32 = 0

            for id in beasts.getIDs() {
                
                // Check if beast NFT has been collected before
                if(!HunterScore.beastsCollected[wallet]!.contains(id)) {
                    // Add points depending on skin and star level
                    var beast = beasts.borrowBeast(id: id)!
                    var skinAndStarLevel = beast.getBeastTemplate().skin.concat(" ").concat(beast.getBeastTemplate().starLevel.toString())
                    
                    if(HunterScore.pointTable[skinAndStarLevel] != nil) {
                        points = points + HunterScore.pointTable[skinAndStarLevel]!
                        
                        // Add ID into beastsCollected
                        HunterScore.beastsCollected[wallet]!.append(id)
                    }

                    // Check if new beastTemplate has been collected
                    if(!HunterScore.beastTemplatesCollected[wallet]!.contains(beast.getBeastTemplate().beastTemplateID)) {
                        //Register that new beastTemplate has been collected by wallet
                        HunterScore.beastTemplatesCollected[wallet]!.append(beast.getBeastTemplate().beastTemplateID)
                    }
                }
            }

            if(HunterScore.hunterScores[wallet] != nil) {
                HunterScore.hunterScores[wallet] = HunterScore.hunterScores[wallet]! + points
            } else {
                HunterScore.hunterScores[wallet] = points
            }

        //TODO emit hunter score event
        }

        return <- beasts

    }

    pub fun getHunterScores(): {Address: UInt32} {
        return self.hunterScores
    }

    pub fun getHunterScore(wallet: Address): UInt32? {
        return self.hunterScores[wallet]
    }

    pub fun getAllBeastsCollected(): {Address: [UInt64]} {
        return self.beastsCollected
    }

    pub fun getBeastsCollected(wallet: Address): [UInt64]? {
        return self.beastsCollected[wallet]
    }

    pub fun getAllBeastTemplatesCollected(): {Address: [UInt32]} {
        return self.beastTemplatesCollected
    }

    pub fun getBeastTemplatesCollected(wallet: Address): [UInt32]? {
        return self.beastTemplatesCollected[wallet]
    }

    pub fun getPointTable(): {String: UInt32} {
        return self.pointTable
    }

    pub fun getPointReward(skinAndStarLevel: String): UInt32? {
        return self.pointTable[skinAndStarLevel]
    }

    pub fun getAllBanned(): [Address] {
        return self.banned
    }

    pub fun isAddressBanned(wallet: Address): Bool {
        return self.banned.contains(wallet)
    }

    init() {
        // Set named paths
        self.AdminStoragePath = /storage/HunterScoreAdmin
        self.AdminPrivatePath = /private/HunterScoreAdminUpgrade

        self.hunterScores = {}
        self.beastsCollected = {}
        self.beastTemplatesCollected = {}
        self.banned = []
        self.pointTable = {
            "Normal 1": 10,
            "Normal 2": 30,
            "Normal 3": 90,
            "Metallic Silver 1": 50,
            "Metallic Silver 2": 150,
            "Metallic Silver 3": 450,
            "Cursed Black 1": 300,
            "Cursed Black 2": 900,
            "Cursed Black 3": 2700,
            "Shiny Gold 1": 1000,
            "Shiny Gold 2": 3000,
            "Shiny Gold 3": 9000,
            "Mythic Diamond 1": 10000,
            "Mythic Diamond 2": 10000,
            "Mythic Diamond 3": 10000
        }

        // Put Admin in storage
        self.account.save(<-create Admin(), to: self.AdminStoragePath)

        self.account.link<&HunterScore.Admin>(
            self.AdminPrivatePath,
            target: self.AdminStoragePath
        ) ?? panic("Could not get a capability to the admin")
    }
}