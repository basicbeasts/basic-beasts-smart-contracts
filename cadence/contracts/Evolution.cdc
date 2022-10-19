import BasicBeasts from "./BasicBeasts.cdc"
import HunterScore from "./HunterScore.cdc"

//TODO: Events
pub contract Evolution {

    // -----------------------------------------------------------------------
    // Evolution Events
    // -----------------------------------------------------------------------

    // -----------------------------------------------------------------------
    // Named Paths
    // -----------------------------------------------------------------------
    pub let EvolverStoragePath: StoragePath
    pub let EvolverPublicPath: PublicPath
    pub let AdminStoragePath: StoragePath
    pub let AdminPrivatePath: PrivatePath

    // -----------------------------------------------------------------------
    // Evolution Fields
    // -----------------------------------------------------------------------
    pub var publicEvolutionPaused: Bool

    // Variable size dictionary of evolutionPairs
    //
    // Key = beastTemplateID of lower star level 
    // that can evolve into the higher star level
    //
    // Value = beastTemplateID of higher star level
    //
    access(self) var evolutionPairs: {UInt32: UInt32}
    access(self) var mythicPairs: {UInt32: UInt32} 
    access(self) var revealedBeasts: [UInt64] 

    //TODO: make sure it gets incremented during all types of evolution
    // To count how many 1-star and 2-star beasts have been burned from evolution
    access(self) var numberEvolvedPerBeastTemplate: {UInt32: UInt32}

    pub resource interface Public {
        pub let id: UInt64
    }

    pub resource Evolver: Public {
        pub let id: UInt64

        init() {
            self.id = self.uuid
        }
        // This evolution function cannot create any Mythic Diamond skins.
        // Sets first owner
        // Increase Hunter score
        pub fun evolveBeast(beasts: @BasicBeasts.Collection): @BasicBeasts.Collection {
            pre {
                !Evolution.publicEvolutionPaused: "Cannot evolve Beast: Public Evolution is paused"
                beasts.getIDs().length == 3: "Cannot evolve Beast: Number of beasts to evolve must be 3" //TODO Can be removed because of helper function
            }

            let checkedBeasts <- Evolution.validateBeastsForEvolution(beasts: <- beasts)

            let evolvedBeast <- Evolution.mintEvolvedBeast(beasts: <- checkedBeasts)

            let beastCollection <- HunterScore.increaseHunterScore(wallet: self.owner!.address, beasts: <- evolvedBeast)

            let IDs = beastCollection.getIDs()

            let beast <- beastCollection.withdraw(withdrawID: IDs[0]) as! @BasicBeasts.NFT

            beast.setFirstOwner(firstOwner: self.owner!.address)

            beastCollection.deposit(token: <- beast)

            return <- beastCollection

        }
    }

    // -----------------------------------------------------------------------
    // Admin Resource Functions
    //
    // Admin is a special authorization resource that 
    // allows the owner to perform important NFT functions
    // -----------------------------------------------------------------------
    pub resource Admin {

        // TODO: Admin Evolve Beast must require address of First Owner so it is set immediately and can't be changed ever again.
        pub fun evolveBeast(beasts: @BasicBeasts.Collection, isMythic: Bool, firstOwner: Address): @BasicBeasts.Collection {
            pre {
                beasts.getIDs().length == 3: "Cannot evolve Beast: Number of beasts to evolve must be 3" //TODO: Remove because of helper function
            }

            //This should panic and revert the transaction if the beasts can't evolve
            let checkedBeasts <- Evolution.validateBeastsForEvolution(beasts: <- beasts)

            if(isMythic) {
                //TODO: These three constants below could just be inside the next if statement or the if statement could be added into one.
                //Mint and return Mythic Beast
                let IDs = checkedBeasts.getIDs()

                let beastTemplateID = checkedBeasts.borrowBeast(id: IDs[0])!.getBeastTemplate().beastTemplateID
                
                // Get beastTemplateID of the evolved mythic Beast
                let evolvedMythicBeastTemplateID = Evolution.mythicPairs[Evolution.evolutionPairs[beastTemplateID]!]! //TODO remove comment. Why we don't use mintEvolvedBeast() function

                if(!BasicBeasts.isBeastRetired(beastTemplateID: evolvedMythicBeastTemplateID)!) {

                    // Get EvolvedFrom
                    let evolvedFrom: [BasicBeasts.BeastNftStruct] = []

                    for id in checkedBeasts.getIDs() {
                        let beast: &BasicBeasts.NFT{BasicBeasts.Public} = checkedBeasts.borrowBeast(id: id)!

                        let newBeastNftStruct = BasicBeasts.BeastNftStruct(
                                                            id: beast.id,
                                                            serialNumber: beast.serialNumber,
                                                            sex: beast.sex,
                                                            beastTemplateID: beast.getBeastTemplate().beastTemplateID,
                                                            firstOwner: beast.getFirstOwner()
                                                            )

                        evolvedFrom.append(newBeastNftStruct)
                    }
                    
                    let evolvedMythicBeastCollection: @BasicBeasts.Collection <- BasicBeasts.createEmptyCollection() as! @BasicBeasts.Collection

                    // Mint evolved beast
                    let evolvedMythicBeast: @BasicBeasts.NFT <- BasicBeasts.mintBeast(
                                                                    beastTemplateID: evolvedMythicBeastTemplateID, 
                                                                    matron: nil, 
                                                                    sire: nil, 
                                                                    evolvedFrom: evolvedFrom
                                                                    )

                    evolvedMythicBeast.setFirstOwner(firstOwner: firstOwner)

                    evolvedMythicBeastCollection.deposit(token: <- evolvedMythicBeast)

                    let newBeastCollection <- HunterScore.increaseHunterScore(wallet: firstOwner, beasts: <- evolvedMythicBeastCollection)

                    //Retire Mythic Beast to make sure there will only exist 1
                    BasicBeasts.retireBeast(beastTemplateID: evolvedMythicBeastTemplateID)

                    Evolution.numberEvolvedPerBeastTemplate.insert(key: beastTemplateID, Evolution.numberEvolvedPerBeastTemplate[beastTemplateID]! + 3)

                    // Destroy beasts used for evolution
                    destroy checkedBeasts

                    return <- newBeastCollection
                }

            } 
            
            // Following runs if not Mythic
            // Standard just like public evolveBeast()
            //
            let evolvedBeast <- Evolution.mintEvolvedBeast(beasts: <- checkedBeasts)

            let newBeastCollection <- HunterScore.increaseHunterScore(wallet: firstOwner, beasts: <- evolvedBeast)

            let IDs = newBeastCollection.getIDs()

            let beast <- newBeastCollection.withdraw(withdrawID: IDs[0]) as! @BasicBeasts.NFT

            beast.setFirstOwner(firstOwner: firstOwner)

            newBeastCollection.deposit(token: <- beast)

            return <- newBeastCollection
                
        }

            // TODO: Admin Reveal Evolved Beast must require address of First Owner so it is set immediately and can't be changed ever again.
        
        
        pub fun revealEvolvedBeast(beast: @BasicBeasts.NFT, firstOwner: Address): @BasicBeasts.NFT {
            pre {
                Evolution.mythicPairs[beast.getBeastTemplate().beastTemplateID] != nil : "Cannot reveal Beast: Beast does not have mythic pair"
                beast.getBeastTemplate().starLevel >= 2 : "Cannot reveal Beast: Beast star level is less than 2"
                !Evolution.revealedBeasts.contains(beast.id) : "Cannot reveal Beast: Beast has already been revealed once."
                BasicBeasts.isBeastRetired(beastTemplateID: Evolution.mythicPairs[beast.getBeastTemplate().beastTemplateID]!) == false : "Cannot reveal Beast: Mythic of this beast has already been minted"
            }

            // probability is fixed to 0.1% chance of beast being revealed as a Mythic
            var probability = 0.001

            var isMythic = Int(beast.uuid) * Int(unsafeRandom()) % 100_000_000 < Int(100_000_000.0 * probability)

            if(isMythic) {
                
                var evolvedMythicBeastTemplateID = Evolution.mythicPairs[beast.getBeastTemplate().beastTemplateID]!

                var evolvedFrom = beast.getEvolvedFrom()

                let evolvedMythicBeast: @BasicBeasts.NFT <- BasicBeasts.mintBeast(
                                                                    beastTemplateID: evolvedMythicBeastTemplateID, 
                                                                    matron: nil, 
                                                                    sire: nil, 
                                                                    evolvedFrom: evolvedFrom
                                                                    )

                evolvedMythicBeast.setFirstOwner(firstOwner: firstOwner)

                let beastCollection: @BasicBeasts.Collection <- BasicBeasts.createEmptyCollection() as! @BasicBeasts.Collection

                beastCollection.deposit(token: <- evolvedMythicBeast)

                let newBeastCollection <- HunterScore.increaseHunterScore(wallet: firstOwner, beasts: <- beastCollection)

                //Retire Mythic Beast to make sure there will only exist 1
                    BasicBeasts.retireBeast(beastTemplateID: evolvedMythicBeastTemplateID)
                
                let IDs = newBeastCollection.getIDs()

                var newMythicBeast <- newBeastCollection.withdraw(withdrawID: IDs[0]) as! @BasicBeasts.NFT
                
                destroy beast

                destroy newBeastCollection

                return <- newMythicBeast
            }

            //Beast has now been revealed once.
            Evolution.revealedBeasts.append(beast.id)

            return <- beast

        }

        pub fun addEvolutionPair(beastTemplateID: UInt32, evolvedBeastTemplateID: UInt32) {
            pre {
                BasicBeasts.getBeastTemplate(beastTemplateID: beastTemplateID) != nil: "Cannot add EvolutionPair: Beast Template ID of lower level Beast doesn't exist"
                BasicBeasts.getBeastTemplate(beastTemplateID: evolvedBeastTemplateID) != nil: "Cannot add EvolutionPair: Beast Template ID of the evolved higher level Beast doesn't exist"
                BasicBeasts.getBeastTemplate(beastTemplateID: beastTemplateID)!.starLevel + 1 == BasicBeasts.getBeastTemplate(beastTemplateID: evolvedBeastTemplateID)!.starLevel: "Cannot add EvolutionPair: Evolved Beast Template must be exactly 1 star level higher than Pre-Evolved Beast Template"
            }
            Evolution.evolutionPairs.insert(key: beastTemplateID, evolvedBeastTemplateID)
            Evolution.numberEvolvedPerBeastTemplate.insert(key: beastTemplateID, 0)
        }

        pub fun addMythicPair(beastTemplateID: UInt32, mythicBeastTemplateID: UInt32) {
            pre{
                BasicBeasts.getBeastTemplate(beastTemplateID: beastTemplateID) != nil: "Cannot add MythicPair: Beast Template ID doesn't exist"
                BasicBeasts.getBeastTemplate(beastTemplateID: mythicBeastTemplateID) != nil: "Cannot add MythicPair: Beast Template ID of the Mythic Diamond Beast doesn't exist"
                BasicBeasts.getBeastTemplate(beastTemplateID: beastTemplateID)!.dexNumber == BasicBeasts.getBeastTemplate(beastTemplateID: mythicBeastTemplateID)!.dexNumber: "Cannot add MythicPair: Beast Template must be of the same dexNumber"
            }
            Evolution.mythicPairs.insert(key: beastTemplateID, mythicBeastTemplateID)
        }

        pub fun pausePublicEvolution() {
            if(!Evolution.publicEvolutionPaused) {
                Evolution.publicEvolutionPaused = true
            }

            //TODO emit event
        }

        pub fun startPublicEvolution() {
            if(Evolution.publicEvolutionPaused) {
                Evolution.publicEvolutionPaused = false
            }

            //TODO emit event
        }

        pub fun createNewAdmin(): @Admin {
            return <-create Admin()
        }

    }

    // -----------------------------------------------------------------------
    // Public Functions
    // -----------------------------------------------------------------------

    pub fun createNewEvolver(): @Evolver {
            return <-create Evolver()
    }
    

    // -----------------------------------------------------------------------
    // Helper Functions
    // -----------------------------------------------------------------------

    // Evolution Helper function 
    // This helper function assumes that all validation needed has been done before calling this function
    //
    access(self) fun mintEvolvedBeast(beasts: @BasicBeasts.Collection): @BasicBeasts.Collection {
        
        var IDs = beasts.getIDs()

        var beastTemplateID = beasts.borrowBeast(id: IDs[0])!.getBeastTemplate().beastTemplateID
        
        // Get beastTemplateID of the evolved Beast
        var evolvedBeastTemplateID = self.evolutionPairs[beastTemplateID]!

        // Get EvolvedFrom
        var evolvedFrom: [BasicBeasts.BeastNftStruct] = []

        for id in beasts.getIDs() {
            let beast: &BasicBeasts.NFT{BasicBeasts.Public} = beasts.borrowBeast(id: id)!

            var newBeastNftStruct = BasicBeasts.BeastNftStruct(
                                                id: beast.id,
                                                serialNumber: beast.serialNumber,
                                                sex: beast.sex,
                                                beastTemplateID: beast.getBeastTemplate().beastTemplateID,
                                                firstOwner: beast.getFirstOwner() 
                                                )

            evolvedFrom.append(newBeastNftStruct)
        }

        let evolvedBeastCollection: @BasicBeasts.Collection <- BasicBeasts.createEmptyCollection() as! @BasicBeasts.Collection

        // Mint evolved beast
        let evolvedBeast: @BasicBeasts.NFT <- BasicBeasts.mintBeast(
                                                        beastTemplateID: evolvedBeastTemplateID,
                                                        matron: nil, 
                                                        sire: nil, 
                                                        evolvedFrom: evolvedFrom
                                                        )

        Evolution.numberEvolvedPerBeastTemplate.insert(key: beastTemplateID, Evolution.numberEvolvedPerBeastTemplate[beastTemplateID]! + 3)

        evolvedBeastCollection.deposit(token: <- evolvedBeast)

        // Destroy beasts used for evolution
        destroy beasts

        return <- evolvedBeastCollection
    }

    // Evolution Helper function
    // Makes sure that the number of beasts are exactly 3
    // that the skin, starLevel, and beastTemplateID is the exact same.
    //
    access(self) fun validateBeastsForEvolution(beasts: @BasicBeasts.Collection): @BasicBeasts.Collection {
        pre {
            beasts.getIDs().length == 3: "Cannot evolve Beast: Number of beasts to evolve must be 3"
        }

        // Match Beast Skin, Star Level, Beast Template ID
        // We check these to match the beasts and panic for each case.
        var skin: String = ""
        var sameSkins: Bool = true

        var starLevel: UInt32 = 0
        var sameStarLevel: Bool = true

        var beastTemplateID: UInt32 = 0
        var sameBeastTemplateID: Bool = true

        // Get a skin, a starLevel, and a beastTemplateID
        var IDs = beasts.getIDs()
        skin = beasts.borrowBeast(id: IDs[0])!.getBeastTemplate().skin
        starLevel = beasts.borrowBeast(id: IDs[0])!.getBeastTemplate().starLevel
        beastTemplateID = beasts.borrowBeast(id: IDs[0])!.getBeastTemplate().beastTemplateID
        
        // Check if skin, star level, and beastTemplateID match
        for id in beasts.getIDs() {
            if(skin != beasts.borrowBeast(id: id)!.getBeastTemplate().skin) {
                sameSkins = false
            }
            if(starLevel != beasts.borrowBeast(id: id)!.getBeastTemplate().starLevel) {
                sameStarLevel = false
            }
            if(beastTemplateID != beasts.borrowBeast(id: id)!.getBeastTemplate().beastTemplateID) {
                sameBeastTemplateID = false
            }
        }

        // Check if evolution pair exists
        if(self.evolutionPairs[beastTemplateID] == nil) {
            panic("Can't evolve beasts: Evolution Pair does not exist")
        }

        if(!sameSkins) {
            panic("Can't evolve beasts: Beasts do not have the same skin")
        }

        if(!sameStarLevel) {
            panic("Can't evolve beasts: Beasts do not have the same star level")
        }

        if(!sameBeastTemplateID) {
            panic("Can't evolve beasts: Beasts are not the same.")
        }

        return <- beasts
    }

    // -----------------------------------------------------------------------
    // Public Getter Functions
    // -----------------------------------------------------------------------    

    pub fun getAllEvolutionPairs(): {UInt32: UInt32} {
        return self.evolutionPairs
    }

    pub fun getAllEvolutionPairsKeys(): [UInt32] {
        return self.evolutionPairs.keys
    }

    pub fun getEvolvedBeastTemplateID(beastTemplateID: UInt32): UInt32? {
        return self.evolutionPairs[beastTemplateID]
    }

    pub fun getAllMythicPairs(): {UInt32: UInt32} {
        return self.mythicPairs
    }

    pub fun getAllMythicPairsKeys(): [UInt32] {
        return self.mythicPairs.keys
    }

    pub fun getMythicBeastTemplateID(beastTemplateID: UInt32): UInt32? {
        return self.mythicPairs[beastTemplateID]
    }

    pub fun getAllNumEvolvedPerBeastTemplate(): {UInt32: UInt32} {
        return self.numberEvolvedPerBeastTemplate
    }

    pub fun getAllNumEvolvedPerBeastTemplateKeys(): [UInt32] {
        return self.numberEvolvedPerBeastTemplate.keys
    }

    pub fun getNumEvolvedPerBeastTemplate(beastTemplateID: UInt32): UInt32? {
        return self.numberEvolvedPerBeastTemplate[beastTemplateID]
    }

    init() {
        // Set named paths
        self.EvolverStoragePath = /storage/BasicBeastsEvolver
        self.EvolverPublicPath = /public/BasicBeastsEvolver
        self.AdminStoragePath = /storage/BasicBeastsEvolutionAdmin
        self.AdminPrivatePath = /private/BasicBeastsEvolutionAdminUpgrade

        // Initialize the fields
        self.publicEvolutionPaused = false
        self.publicEvolutionPaused = false
        self.evolutionPairs = {}
        self.mythicPairs = {}
        self.revealedBeasts = []
        self.numberEvolvedPerBeastTemplate = {}

        // Put Evolver in storage
        self.account.save(<-create Evolver(), to: self.EvolverStoragePath)

        // Put Admin in storage
        self.account.save(<-create Admin(), to: self.AdminStoragePath)

        self.account.link<&Evolution.Admin>(
            self.AdminPrivatePath,
            target: self.AdminStoragePath
        ) ?? panic("Could not get a capability to the admin")
    }
}
 