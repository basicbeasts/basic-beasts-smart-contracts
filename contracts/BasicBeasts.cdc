import NonFungibleToken from "../Flow/NonFungibleToken.cdc"
import MetadataViews from "../Flow/MetadataViews.cdc"
//TODO add metadata standard
//TODO royalties. Ask Pete from Flow
pub contract BasicBeasts: NonFungibleToken {

    // -----------------------------------------------------------------------
    // NonFungibleToken Standard Events
    // -----------------------------------------------------------------------
    pub event ContractInitialized()
    pub event Withdraw(id: UInt64, from: Address?)
    pub event Deposit(id: UInt64, to: Address?)

    // -----------------------------------------------------------------------
    // BasicBeasts Events
    // -----------------------------------------------------------------------
    //TODO
    pub event BeastDestroyed(id: UInt64, serialNumber: UInt32, name: String)

    pub event NewGenerationStarted(newCurrentGeneration: UInt32)

    pub event BeastRetired(beastTemplateID: UInt32, numOfBeastMinted: UInt32)


    // -----------------------------------------------------------------------
    // Named Paths
    // -----------------------------------------------------------------------
    pub let CollectionStoragePath: StoragePath
    pub let CollectionPublicPath: PublicPath
    pub let AdminStoragePath: StoragePath
    pub let AdminPrivatePath: PrivatePath

    // -----------------------------------------------------------------------
    // NonFungibleToken Standard Fields
    // -----------------------------------------------------------------------
    pub var totalSupply: UInt64

    // -----------------------------------------------------------------------
    // BasicBeasts Fields
    // -----------------------------------------------------------------------
    //TODO

    // Generation that a BeastTemplate belongs to.
    // Generation is a concept that indicates a group of BeastTemplates through time.
    // Many BeastTemplates can exist at a time, but only one generation.
    pub var currentGeneration: UInt32

    pub var publicEvolutionPaused: Bool

    pub var publicBreedingPaused: Bool

    // Variable size dictionary of beastTemplate structs
    access(self) var beastTemplates: {UInt32: BeastTemplate}

    // Variable size dictionary of evolutionPairs
    //
    // Key = beastTemplateID of lower star level 
    // that can evolve into the higher star level
    //
    // Value = beastTemplateID of higher star level
    //
    access(self) var evolutionPairs: {UInt32: UInt32} //TODO maybe Evolution contract

    access(self) var mythicPairs: {UInt32: UInt32} //TODO maybe Evolution contract

    access(self) var retired: {UInt32: Bool}

    access(self) var numOfMintedPerBeastTemplate: {UInt32: UInt32}

    // TODO
    // Maybe move to an Evolution contract
    access(self) var numOfEvolvedPerBeastTemplate: {UInt32: UInt32}

    pub struct BeastTemplate {

        pub let beastTemplateID: UInt32

        pub let generation: UInt32

        pub let dexNumber: UInt32

        pub let name: String

        pub let description: String

        pub let image: String

        pub let imageTransparentBg: String

        pub let animation_url: String?

        pub let external_url: String?

        pub let rarity: String

        pub let skin: String

        pub let starLevel: UInt32

        pub let asexual: Bool

        // Can be born from breeding
        pub let breedable: Bool

        // Maximum mint by Admin allowed
        pub let maxAdminMintAllowed: UInt32

        pub let ultimateSkill: String

        pub let basicSkills: [String]

        pub let elements: [String]

        pub let data: {String: String}

        init(
            beastTemplateID: UInt32, 
            dexNumber: UInt32,
            name: String,
            description: String,
            image: String,
            imageTransparentBg: String,
            animation_url: String?,
            external_url: String?,
            rarity: String,
            skin: String,
            starLevel: UInt32, 
            asexual: Bool,
            breedable: Bool,
            maxAdminMintAllowed: UInt32,
            ultimateSkill: String,
            basicSkills: [String],
            elements: [String],
            data: {String: String}
            ) {
            pre {
                BasicBeasts.beastTemplates.keys.contains(beastTemplateID) == false: "Cannot initialize Beast Template: The BeastTemplate has already been added to the BasicBeasts Contract."
                dexNumber > 0: "Cannot initialize new Beast Template: dexNumber cannot be 0"
                name != "": "Cannot initialize new Beast Template: name cannot be blank" 
                description != "": "Cannot initialize new Beast Template: description cannot be blank" 
                image != "": "Cannot initialize new Beast Template: description cannot be blank" 
                imageTransparentBg != "": "Cannot initialize new Beast Template: description cannot be blank" 
                rarity != "": "Cannot initialize new Beast Template: description cannot be blank" 
                skin != "": "Cannot initialize new Beast Template: description cannot be blank" 
                starLevel > 0: "Cannot initialize new Beast Template: starLevel cannot be 0" 
                maxAdminMintAllowed == 0 && starLevel < 1: "Cannot initialize new Beast Template: maxAdminMintAllowed must be 0 if starLevel is higher than 1" 
                ultimateSkill != "": "Cannot initialize new Beast Template: description cannot be blank" 
                basicSkills.length != 0: ""

            }
            self.beastTemplateID = beastTemplateID
            self.generation = BasicBeasts.currentGeneration
            self.dexNumber = dexNumber
            self.name = name
            self.description = description
            self.image = image
            self.imageTransparentBg = imageTransparentBg
            self.animation_url = animation_url
            self.external_url = external_url
            self.rarity = rarity
            self.skin = skin
            self.starLevel = starLevel
            self.asexual = asexual
            self.breedable = breedable
            self.maxAdminMintAllowed = maxAdminMintAllowed
            self.ultimateSkill = ultimateSkill
            self.basicSkills = basicSkills
            self.elements = elements
            self.data = data

            // TODO emit BeastTemplateCreated(...)
        }
    }

    pub struct BeastNFTStruct {

    }

    pub resource NFT: NonFungibleToken.INFT {
        pub let id: UInt64

        pub let serialNumber: UInt32

        pub let sex: String

        pub let hatchedAt: UInt64?

        pub let matron: UInt64?

        pub let sire: UInt64?

        access(contract) let beastTemplate: BeastTemplate

        access(contract) var nickname: String?

        access(contract) var beneficiary: Address?

        access(contract) let evolvedFrom: [BeastNFTStruct]?

        init(serialNumber: UInt32, 
            hatchedAt: UInt64?, 
            matron: UInt64?, 
            sire: UInt64?, 
            beastTemplateID: UInt32, 
            evolvedFrom: [BeastNFTStruct]?) {

            pre {
            BasicBeasts.beastTemplates[beastTemplateID] != nil: "Cannot mint Beast: Beast Template ID does not exist"
            }
            
            BasicBeasts.totalSupply = BasicBeasts.totalSupply + 1

            BasicBeasts.numOfMintedPerBeastTemplate[beastTemplateID] = BasicBeasts.numOfMintedPerBeastTemplate[beastTemplateID]! + 1 

            self.id = self.uuid //TODO: Ask Jacob if this is fine. Or if it should be received as a parameter input

            self.serialNumber = serialNumber

            var beastTemplate = BasicBeasts.beastTemplates[beastTemplateID]!

            var tempSex = "Asexual" 

            if !beastTemplate.asexual {
                // Get random 0 or 1 and assign sex as either 
                // Female or Male depending on the result
                var random = unsafeRandom() % 2

                if 0 == Int(random) {
                    tempSex = "Female"
                } else {
                    tempSex = "Male"
                }
            }

            self.sex = tempSex
            self.hatchedAt = hatchedAt
            self.matron = matron
            self.sire = sire
            self.beastTemplate = beastTemplate
            self.nickname = nil
            self.beneficiary = nil
            self.evolvedFrom = evolvedFrom

            //TODO emit BeastMinted(...)
        }

        pub fun setNickname(nickname: String) {
            self.nickname = nickname

            //TODO emit BeastNewNicknameIsSet(id: self.id, nickname: self.nickname!)
        }

        // setBeneficiary sets the beneficiary of this NFT
        // this action cannot be undone
        // 
        // Parameters: beneficiary: The address of the beneficiary
        //
        pub fun setBeneficiary(beneficiary: Address) {
            pre {
                self.beneficiary == nil: "Beneficiary is already initialized"
            }

            self.beneficiary = beneficiary

            //TODO emit BeastBeneficiaryIsSet(id: self.id, beneficiary: self.beneficiary!)
        }
        
        pub fun getBeastTemplate(): BeastTemplate {
            return self.beastTemplate
        }

        pub fun getNickname(): String? {
            return self.nickname
        }

        pub fun getBeneficiary(): Address? {
            return self.beneficiary
        }

        pub fun getEvolvedFrom(): [BeastNFTStruct]? {
            return self.evolvedFrom
        }

        destroy() {
            emit BeastDestroyed(id: self.id, serialNumber: self.serialNumber, name: self.beastTemplate.name)
        }
        
    }

    // -----------------------------------------------------------------------
    // Admin Functions
    //
    // Admin is a special authorization resource that 
    // allows the owner to perform important NFT 
    // functions
    // -----------------------------------------------------------------------
    pub resource Admin {

        pub fun createBeastTemplate(
                                    beastTemplateID: UInt32, 
                                    dexNumber: UInt32,
                                    name: String,
                                    description: String,
                                    image: String,
                                    imageTransparentBg: String,
                                    animation_url: String?,
                                    external_url: String?,
                                    rarity: String,
                                    skin: String,
                                    starLevel: UInt32, 
                                    asexual: Bool,
                                    breedable: Bool,
                                    maxAdminMintAllowed: UInt32,
                                    ultimateSkill: String,
                                    basicSkills: [String],
                                    elements: [String],
                                    data: {String: String}
                                    ): UInt32 {
            pre {
                BasicBeasts.beastTemplates[beastTemplateID] == nil: "Cannot create Beast Template: Beast Template ID already exist"
                BasicBeasts.numOfMintedPerBeastTemplate[beastTemplateID] == nil: "Cannot create Beast Template: Beast Template has already been created"
            }

            var newBeastTemplate = BeastTemplate(
                                                beastTemplateID: beastTemplateID, 
                                                dexNumber: dexNumber,
                                                name: name,
                                                description: description,
                                                image: image,
                                                imageTransparentBg: imageTransparentBg,
                                                animation_url: animation_url,
                                                external_url: external_url,
                                                rarity: rarity,
                                                skin: skin,
                                                starLevel: starLevel, 
                                                asexual: asexual,
                                                breedable: breedable,
                                                maxAdminMintAllowed: maxAdminMintAllowed,
                                                ultimateSkill: ultimateSkill,
                                                basicSkills: basicSkills,
                                                elements: elements,
                                                data: data
                                                )

            BasicBeasts.retired[beastTemplateID] = false

            BasicBeasts.numOfMintedPerBeastTemplate[beastTemplateID] = 0

            let newID = newBeastTemplate.beastTemplateID

            BasicBeasts.beastTemplates[newID] = newBeastTemplate

            return newID
        }

        pub fun mintBeast(beastTemplateID: UInt32): @NFT {
            pre {
                BasicBeasts.beastTemplates[beastTemplateID] != nil: "Cannot mint Beast: Beast Template ID does not exist"
                BasicBeasts.numOfMintedPerBeastTemplate[beastTemplateID]! < BasicBeasts.beastTemplates[beastTemplateID]!.maxAdminMintAllowed: "Cannot mint Beast: Max mint by Admin allowance has been reached"
                !BasicBeasts.retired[beastTemplateID]!: "Cannot mint Beast: Beast is retired"
                BasicBeasts.beastTemplates[beastTemplateID]!.starLevel < 2: "Cannot mint Beast: Star level is higher than 1"
            }

            var serialNumber = BasicBeasts.numOfMintedPerBeastTemplate[beastTemplateID]! + 1

            let newBeast: @NFT <- create NFT(
                                            serialNumber: serialNumber,
                                            hatchedAt: nil, 
                                            matron: nil, 
                                            sire: nil, 
                                            beastTemplateID: beastTemplateID, 
                                            evolvedFrom: nil
                                            )

            return <- newBeast
        }

        pub fun retireBeast(beastTemplateID: UInt32) {
            pre {
                BasicBeasts.retired[beastTemplateID] != nil: "Cannot retire the Beast: The Beast Template ID doesn't exist."
            }

            if !BasicBeasts.retired[beastTemplateID]! {
                BasicBeasts.retired[beastTemplateID] = true

                 emit BeastRetired(beastTemplateID: beastTemplateID, numOfBeastMinted: BasicBeasts.numOfMintedPerBeastTemplate[beastTemplateID]!)
            }
        }

        pub fun evolveBeast() {}

        pub fun revealEvolvedBeast() {
            
        }

        pub fun addEvolutionPair(beastTemplateID: UInt32, evolvedBeastTemplateID: UInt32) {
            BasicBeasts.evolutionPairs.insert(key: beastTemplateID, evolvedBeastTemplateID)
        }

        pub fun pausePublicEvolution() {
            if(!BasicBeasts.publicEvolutionPaused) {
                BasicBeasts.publicEvolutionPaused = true
            }
        }

        pub fun startPublicEvolution() {
            if(BasicBeasts.publicEvolutionPaused) {
                BasicBeasts.publicEvolutionPaused = false
            }
        }

        pub fun pausePublicBreeding() {
            if(!BasicBeasts.publicBreedingPaused) {
                BasicBeasts.publicBreedingPaused = true
            }
        }

        pub fun startPublicBreeding() {
            if(BasicBeasts.publicBreedingPaused) {
                BasicBeasts.publicBreedingPaused = false
            }
        }

        pub fun startNewGeneration(): UInt32 {
            BasicBeasts.currentGeneration = BasicBeasts.currentGeneration + 1

            emit NewGenerationStarted(newCurrentGeneration: BasicBeasts.currentGeneration)

            return BasicBeasts.currentGeneration
        }

        pub fun createNewAdmin(): @Admin {
            return <-create Admin()
        }

    }

    pub resource interface BeastCollectionPublic {
        pub fun deposit(token: @NonFungibleToken.NFT)
        pub fun getIDs(): [UInt64]
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT
        pub fun borrowBeast(id: UInt64): &BasicBeasts.NFT? { 
            post {
                (result == nil) || (result?.id == id): 
                    "Cannot borrw Beast reference: The ID of the returned reference is incorrect"
            }
        }

    }

    pub resource Collection: BeastCollectionPublic, NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic {

        pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

        init() {
            self.ownedNFTs <- {}
        }

        pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
            let token <- self.ownedNFTs.remove(key: withdrawID) 
                ?? panic("Cannot withdraw: The Beast does not exist in the Collection")
            emit Withdraw(id: token.id, from: self.owner?.address)
            return <-token
        }

        pub fun deposit(token: @NonFungibleToken.NFT) {
            let token <- token as! @BasicBeasts.NFT
            let id = token.id
            let oldToken <- self.ownedNFTs[id] <- token
            if self.owner?.address != nil {
                emit Deposit(id: id, to: self.owner?.address)
            }
            destroy oldToken
        }

        pub fun getIDs(): [UInt64] {
            return self.ownedNFTs.keys
        }

        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT {
            return &self.ownedNFTs[id] as &NonFungibleToken.NFT
        }

        pub fun borrowBeast(id: UInt64): &BasicBeasts.NFT? {
            if self.ownedNFTs[id] != nil { 
                let ref = &self.ownedNFTs[id] as auth &NonFungibleToken.NFT
                return ref as! &BasicBeasts.NFT
            } else {
                return nil
            }
        }

        destroy() {
            destroy self.ownedNFTs
        }
    }

    // -----------------------------------------------------------------------
    // Public Contract-Level Functions
    // -----------------------------------------------------------------------

    // This evolution function cannot create any Mythic Diamond skins.
    pub fun evolveBeast(beasts: @BasicBeasts.Collection): @BasicBeasts.Collection {
        pre {
            !BasicBeasts.publicEvolutionPaused: "Cannot evolve Beast: Public Evolution is paused"
            beasts.getIDs().length == 3: "Cannot evolve Beast: Number of beasts to evolve must be 3"
        }

        // Match Beast Skin, Star Level, Beast Template ID
        // We check each to panic for each case.
        var skin: String = ""
        var sameSkins: Bool = true

        var starLevel: UInt32 = 0
        var sameStarLevel: Bool = true

        var beastTemplateID: UInt32 = 0
        var sameBeastTemplateID: Bool = true

        // Get a skin, a starLevel, and a beastTemplateID
        for id in beasts.getIDs() {
            skin = beasts.borrowBeast(id: id)!.beastTemplate.skin
            starLevel = beasts.borrowBeast(id: id)!.beastTemplate.starLevel
            beastTemplateID = beasts.borrowBeast(id: id)!.beastTemplate.beastTemplateID
        }

        // Check if skin, star level, and beastTemplateID match
        for id in beasts.getIDs() {
            if(skin != beasts.borrowBeast(id: id)!.beastTemplate.skin) {
                sameSkins = false
            }
            if(starLevel != beasts.borrowBeast(id: id)!.beastTemplate.starLevel) {
                sameStarLevel = false
            }
            if(beastTemplateID != beasts.borrowBeast(id: id)!.beastTemplate.beastTemplateID) {
                sameBeastTemplateID = false
            }
        }

        if(sameSkins) {
            if(sameStarLevel) {
                if(sameBeastTemplateID) {
                    
                let evolvedBeastCollection: @BasicBeasts.Collection <- BasicBeasts.createEmptyCollection() as! @BasicBeasts.Collection
                
                // Get beastTemplateID

                // Get serial number

                // Get EvolvedFrom
        
                let evolvedBeast: @NFT <- create NFT(
                                                    serialNumber: 1, 
                                                    hatchedAt: nil, 
                                                    matron: nil,
                                                    sire: nil,
                                                    beastTemplateID: 1,
                                                    evolvedFrom: []
                                                    )

                evolvedBeastCollection.deposit(token: <- evolvedBeast)

                destroy beasts

                return <- evolvedBeastCollection

                } else {
                    panic("Can't evolve beasts: Beasts are not the same.")
                }
            } else {
                panic("Can't evolve beasts: Beasts do not have the same star level")
            }
        } else { 
            panic("Can't evolve beasts: Beasts do not have the same skin")
        }
        
        // If beasts can't evolve return the beasts
        return <- beasts
    }



    

    // -----------------------------------------------------------------------
    // NonFungibleToken Standard Functions
    // -----------------------------------------------------------------------

    pub fun createEmptyCollection(): @NonFungibleToken.Collection {
        return <-create self.Collection()
    }

    init() {
        // Set named paths
        self.CollectionStoragePath = /storage/BasicBeastsCollection
        self.CollectionPublicPath = /public/BasicBeastsCollection
        self.AdminStoragePath = /storage/BasicBeastsAdmin
        self.AdminPrivatePath = /private/BasicBeastsAdminUpgrade

        // Initialize the fields
        self.totalSupply = 0
        self.currentGeneration = 1
        self.publicEvolutionPaused = false
        self.publicBreedingPaused = false
        self.beastTemplates = {}
        self.evolutionPairs = {}
        self.mythicPairs = {}
        self.retired = {}
        self.numOfMintedPerBeastTemplate = {}
        self.numOfEvolvedPerBeastTemplate = {}

        // Put a new Collection in storage
        self.account.save<@Collection>(<- create Collection(), to: self.CollectionStoragePath)

        // Create a public capability for the Collection
        self.account.link<&Collection{BeastCollectionPublic}>(self.CollectionPublicPath, target: self.CollectionStoragePath)

        // Put Admin in storage
        self.account.save(<-create Admin(), to: self.AdminStoragePath)

        self.account.link<&BasicBeasts.Admin>(
            self.AdminPrivatePath,
            target: self.AdminStoragePath
        ) ?? panic("Could not get a capability to the admin")

        emit ContractInitialized()
    }
}
