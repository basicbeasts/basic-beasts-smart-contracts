import NonFungibleToken from "../flow/NonFungibleToken.cdc"
import MetadataViews from "../flow/MetadataViews.cdc"
//TODO add metadata standard. The type of display we want.
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
    //TODO events
    pub event BeastDestroyed(id: UInt64, serialNumber: UInt32, beastTemplateID: UInt32)
    pub event NewGenerationStarted(newCurrentGeneration: UInt32)
    pub event BeastRetired(beastTemplateID: UInt32, numberMintedPerBeastTemplate: UInt32)

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

    // Generation that a BeastTemplate belongs to.
    // Generation is a concept that indicates a group of BeastTemplates through time.
    // Many BeastTemplates can exist at a time, but only one generation.
    pub var currentGeneration: UInt32

    // Variable size dictionary of beastTemplate structs
    access(self) var beastTemplates: {UInt32: BeastTemplate}

    access(self) var retired: {UInt32: Bool}

    access(self) var numberMintedPerBeastTemplate: {UInt32: UInt32}

    //TODO: Maybe add maxAdminMintAllowed/maxAdminMintPerBeastTemplate here as a field {UInt32: UInt32}
    

    pub struct BeastTemplate {

        pub let beastTemplateID: UInt32

        pub let generation: UInt32

        pub let dexNumber: UInt32

        pub let name: String

        pub let description: String

        pub let image: String

        pub let imageTransparentBg: String

        pub let animationUrl: String?

        pub let externalUrl: String?

        pub let rarity: String

        pub let skin: String

        // 0 for beasts with no evolutionary line
        pub let starLevel: UInt32

        pub let asexual: Bool

        // The BeastTemplate ID that can be born from this Beast Template
        pub let breedableBeastTemplateID: UInt32

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
            animationUrl: String?,
            externalUrl: String?,
            rarity: String,
            skin: String,
            starLevel: UInt32, 
            asexual: Bool,
            breedableBeastTemplateID: UInt32,
            maxAdminMintAllowed: UInt32,
            ultimateSkill: String,
            basicSkills: [String],
            elements: [String],
            data: {String: String}
            ) {
            pre {
                dexNumber > 0: "Cannot initialize new Beast Template: dexNumber cannot be 0"
                name != "": "Cannot initialize new Beast Template: name cannot be blank" 
                description != "": "Cannot initialize new Beast Template: description cannot be blank" 
                image != "": "Cannot initialize new Beast Template: image cannot be blank" 
                imageTransparentBg != "": "Cannot initialize new Beast Template: imageTransparentBg cannot be blank" 
                rarity != "": "Cannot initialize new Beast Template: rarity cannot be blank" 
                skin != "": "Cannot initialize new Beast Template: skin cannot be blank" 
                ultimateSkill != "": "Cannot initialize new Beast Template: ultimate cannot be blank" 
                basicSkills.length != 0: "Cannot initialize new Beast Template: basicSkills cannot be empty"
            }

            self.beastTemplateID = beastTemplateID
            self.generation = BasicBeasts.currentGeneration
            self.dexNumber = dexNumber
            self.name = name
            self.description = description
            self.image = image
            self.imageTransparentBg = imageTransparentBg
            self.animationUrl = animationUrl
            self.externalUrl = externalUrl
            self.rarity = rarity
            self.skin = skin
            self.starLevel = starLevel
            self.asexual = asexual
            self.breedableBeastTemplateID = breedableBeastTemplateID
            self.maxAdminMintAllowed = maxAdminMintAllowed
            self.ultimateSkill = ultimateSkill
            self.basicSkills = basicSkills
            self.elements = elements
            self.data = data
        }
    }

    pub struct BeastNftStruct {
        pub let id: UInt64
        pub let serialNumber: UInt32
        pub let sex: String
        pub let beastTemplateID: UInt32
        pub let firstOwner: Address?

        init(id: UInt64, serialNumber: UInt32, sex: String, beastTemplateID: UInt32, firstOwner: Address?) {
            self.id = id
            self.serialNumber = serialNumber
            self.sex = sex
            self.beastTemplateID = beastTemplateID
            self.firstOwner = firstOwner
        }

    }

    pub resource interface Public {
        pub let id: UInt64
        pub let serialNumber: UInt32
        pub let sex: String
        pub let matron: BeastNftStruct?
        pub let sire: BeastNftStruct?
        access(contract) let beastTemplate: BeastTemplate
        access(contract) var nickname: String
        access(contract) var firstOwner: Address?
        access(contract) let evolvedFrom: [BeastNftStruct]?
        pub fun getBeastTemplate(): BeastTemplate
        pub fun getNickname(): String?
        pub fun getFirstOwner(): Address?
        pub fun getEvolvedFrom(): [BeastNftStruct]?
    }

    pub resource NFT: NonFungibleToken.INFT, Public, MetadataViews.Resolver {
        pub let id: UInt64

        pub let serialNumber: UInt32

        pub let sex: String

        pub let matron: BeastNftStruct?

        pub let sire: BeastNftStruct?

        access(contract) let beastTemplate: BeastTemplate

        access(contract) var nickname: String

        access(contract) var firstOwner: Address?

        access(contract) let evolvedFrom: [BeastNftStruct]?

        init(
            beastTemplateID: UInt32, 
            matron: BeastNftStruct?, 
            sire: BeastNftStruct?, 
            evolvedFrom: [BeastNftStruct]?
            ) {

            pre {
            BasicBeasts.beastTemplates[beastTemplateID] != nil: "Cannot mint Beast: Beast Template ID does not exist"
            }
            
            BasicBeasts.totalSupply = BasicBeasts.totalSupply + 1

            BasicBeasts.numberMintedPerBeastTemplate[beastTemplateID] = BasicBeasts.numberMintedPerBeastTemplate[beastTemplateID]! + 1 

            self.id = self.uuid

            self.serialNumber = BasicBeasts.numberMintedPerBeastTemplate[beastTemplateID]!

            var beastTemplate = BasicBeasts.beastTemplates[beastTemplateID]!

            var sex = "Asexual" 

            if !beastTemplate.asexual {
                // Female or Male depending on the result
                var probability = 0.5

                var isFemale = Int(self.uuid) * Int(unsafeRandom()) % 100_000_000 < Int(100_000_000.0 * probability)

                if isFemale {
                    sex = "Female"
                } else {
                    sex = "Male"
                }
            }

            self.sex = sex
            self.matron = matron
            self.sire = sire
            self.beastTemplate = beastTemplate
            self.nickname = beastTemplate.name
            self.firstOwner = nil
            self.evolvedFrom = evolvedFrom

            //TODO emit BeastMinted(...)
        }

        pub fun setNickname(nickname: String) {
            pre {
                BasicBeasts.validateNickname(nickname: nickname): "Can't change nickname: Nickname is more than 16 characters"
            }

            if (nickname.length == 0) {
                self.nickname = self.beastTemplate.name
            } else {
                self.nickname = nickname
            }

            

            //TODO emit BeastNewNicknameIsSet(id: self.id, nickname: self.nickname!)
        }

        // setFirstOwner sets the First Owner of this NFT
        // this action cannot be undone
        // 
        // Parameters: firstOwner: The address of the firstOwner
        //
        pub fun setFirstOwner(firstOwner: Address) {
            pre {
                self.firstOwner == nil: "First Owner is already initialized"
            }

            self.firstOwner = firstOwner

            //TODO emit BeastFirstOwnerIsSet(id: self.id, firstOwner: self.firstOwner!)
        }
        
        pub fun getBeastTemplate(): BeastTemplate {
            return self.beastTemplate
        }

        pub fun getNickname(): String? {
            return self.nickname
        }

        pub fun getFirstOwner(): Address? {
            return self.firstOwner
        }

        pub fun getEvolvedFrom(): [BeastNftStruct]? {
            return self.evolvedFrom
        }

        pub fun getViews(): [Type] {
			return [
			Type<MetadataViews.Display>()
			]
		}

        pub fun resolveView(_ view: Type): AnyStruct? {
			switch view {
			case Type<MetadataViews.Display>():
				return MetadataViews.Display(
					name: self.nickname,
					description: self.beastTemplate.description,
					thumbnail: MetadataViews.IPFSFile(cid: "", path: nil)
				)
		    }
			return nil
        }

        destroy() {
            emit BeastDestroyed(id: self.id, serialNumber: self.serialNumber, beastTemplateID: self.beastTemplate.beastTemplateID)
        }
        
    }

    // -----------------------------------------------------------------------
    // Admin Resource Functions
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
                                    animationUrl: String?,
                                    externalUrl: String?,
                                    rarity: String,
                                    skin: String,
                                    starLevel: UInt32, 
                                    asexual: Bool,
                                    breedableBeastTemplateID: UInt32,
                                    maxAdminMintAllowed: UInt32,
                                    ultimateSkill: String,
                                    basicSkills: [String],
                                    elements: [String],
                                    data: {String: String}
                                    ): UInt32 {
            pre {
                BasicBeasts.beastTemplates[beastTemplateID] == nil: "Cannot create Beast Template: Beast Template ID already exist"
                BasicBeasts.numberMintedPerBeastTemplate[beastTemplateID] == nil: "Cannot create Beast Template: Beast Template has already been created"
            }

            var newBeastTemplate = BeastTemplate(
                                                beastTemplateID: beastTemplateID, 
                                                dexNumber: dexNumber,
                                                name: name,
                                                description: description,
                                                image: image,
                                                imageTransparentBg: imageTransparentBg,
                                                animationUrl: animationUrl,
                                                externalUrl: externalUrl,
                                                rarity: rarity,
                                                skin: skin,
                                                starLevel: starLevel, 
                                                asexual: asexual,
                                                breedableBeastTemplateID: breedableBeastTemplateID,
                                                maxAdminMintAllowed: maxAdminMintAllowed,
                                                ultimateSkill: ultimateSkill,
                                                basicSkills: basicSkills,
                                                elements: elements,
                                                data: data
                                                )

            BasicBeasts.retired[beastTemplateID] = false

            BasicBeasts.numberMintedPerBeastTemplate[beastTemplateID] = 0

            BasicBeasts.beastTemplates[beastTemplateID] = newBeastTemplate

            // TODO emit BeastTemplateCreated(...)

            return newBeastTemplate.beastTemplateID
        }

        pub fun mintBeast(beastTemplateID: UInt32): @NFT {
            // Admin specific pre-condition for minting a beast
            pre {
                BasicBeasts.beastTemplates[beastTemplateID] != nil: "Cannot mint Beast: Beast Template ID does not exist"
                BasicBeasts.numberMintedPerBeastTemplate[beastTemplateID]! < BasicBeasts.beastTemplates[beastTemplateID]!.maxAdminMintAllowed: "Cannot mint Beast: Max mint by Admin allowance for this Beast is reached"
            }

            // When minting genesis beasts. Set matron, sire, evolvedFrom to nil
            let newBeast: @NFT <- BasicBeasts.mintBeast(
                                                        beastTemplateID: beastTemplateID, 
                                                        matron: nil, 
                                                        sire: nil, 
                                                        evolvedFrom: nil
                                                        )

            return <- newBeast
        }

        pub fun retireBeast(beastTemplateID: UInt32) {
            BasicBeasts.retireBeast(beastTemplateID: beastTemplateID)
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
        pub fun borrowBeast(id: UInt64): &BasicBeasts.NFT{Public}? { 
            post {
                (result == nil) || (result?.id == id): 
                    "Cannot borrow Beast reference: The ID of the returned reference is incorrect"
            }
        }

    }

    pub resource Collection: BeastCollectionPublic, NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection {

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

        pub fun borrowBeast(id: UInt64): &BasicBeasts.NFT{Public}? {
            if self.ownedNFTs[id] != nil { 
                let ref = &self.ownedNFTs[id] as auth &NonFungibleToken.NFT
                return ref as! &BasicBeasts.NFT
            } else {
                return nil
            }
        }

        pub fun borrowEntireBeast(id: UInt64): &BasicBeasts.NFT? {
            if self.ownedNFTs[id] != nil { 
                let ref = &self.ownedNFTs[id] as auth &NonFungibleToken.NFT
                return ref as! &BasicBeasts.NFT
            } else {
                return nil
            }
        }

        pub fun borrowViewResolver(id: UInt64): &AnyResource{MetadataViews.Resolver} {
			let nft = &self.ownedNFTs[id] as auth &NonFungibleToken.NFT
			let basicBeastsNFT = nft as! &BasicBeasts.NFT
			return basicBeastsNFT 
		}

        destroy() {
            destroy self.ownedNFTs
        }
    }

    // -----------------------------------------------------------------------
    // Access(Account) Functions
    // -----------------------------------------------------------------------

    // Used for all types of minting of beasts: admin minting, evolution minting, and breeding minting
    access(account) fun mintBeast(beastTemplateID: UInt32, matron: BeastNftStruct?, sire: BeastNftStruct?, evolvedFrom: [BeastNftStruct]?): @NFT {
        // Pre-condition that has to be followed regardless of Admin Minting, Evolution Minting, or Breeding Minting.
        pre {
                BasicBeasts.beastTemplates[beastTemplateID] != nil: "Cannot mint Beast: Beast Template ID does not exist"
                !BasicBeasts.retired[beastTemplateID]!: "Cannot mint Beast: Beast is retired"
            }

        let newBeast: @NFT <- create NFT(
                                        beastTemplateID: beastTemplateID, 
                                        matron: matron, 
                                        sire: sire, 
                                        evolvedFrom: evolvedFrom
                                        )
        
        let skin = newBeast.getBeastTemplate().skin

        if(skin == "Mythic Diamond") {
            BasicBeasts.retireBeast(beastTemplateID: newBeast.getBeastTemplate().beastTemplateID)
        }

        return <- newBeast
    }

    access(account) fun retireBeast(beastTemplateID: UInt32) {
        pre {
            BasicBeasts.retired[beastTemplateID] != nil: "Cannot retire the Beast: The Beast Template ID doesn't exist."
            BasicBeasts.beastTemplates[beastTemplateID]!.skin != "Normal": "Cannot retire the Beast: Cannot retire Normal skin beasts."
        }

        if !BasicBeasts.retired[beastTemplateID]! {
            BasicBeasts.retired[beastTemplateID] = true

            emit BeastRetired(beastTemplateID: beastTemplateID, numberMintedPerBeastTemplate: BasicBeasts.numberMintedPerBeastTemplate[beastTemplateID]!)
        }
    }

    // -----------------------------------------------------------------------
    // Public Functions
    // -----------------------------------------------------------------------

   pub fun validateNickname(nickname: String) : Bool {
		if (nickname.length > 16) {
			return false
		}
		return true
	}

    // -----------------------------------------------------------------------
    // Public Getter Functions
    // -----------------------------------------------------------------------    

    pub fun getAllBeastTemplates(): {UInt32: BeastTemplate} {
        return self.beastTemplates
    }

    pub fun getAllBeastTemplateIDs(): [UInt32] {
        return self.beastTemplates.keys
    }

    pub fun getBeastTemplate(beastTemplateID: UInt32): BeastTemplate? {
        return self.beastTemplates[beastTemplateID]
    }

    pub fun getRetiredDictionary(): {UInt32: Bool} {
        return self.retired
    }

    pub fun getAllRetiredKeys(): [UInt32] {
        return self.retired.keys
    }

    pub fun isBeastRetired(beastTemplateID: UInt32): Bool? {
        return self.retired[beastTemplateID]
    }

    pub fun getAllNumberMintedPerBeastTemplate(): {UInt32: UInt32} {
        return self.numberMintedPerBeastTemplate
    }

    pub fun getAllNumberMintedPerBeastTemplateKeys(): [UInt32] {
        return self.numberMintedPerBeastTemplate.keys
    }

    pub fun getNumberMintedPerBeastTemplate(beastTemplateID: UInt32): UInt32? {
        return self.numberMintedPerBeastTemplate[beastTemplateID]
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
        self.beastTemplates = {}
        self.retired = {}
        self.numberMintedPerBeastTemplate = {}

        // Put Admin in storage
        self.account.save(<-create Admin(), to: self.AdminStoragePath)

        self.account.link<&BasicBeasts.Admin>(self.AdminPrivatePath, target: self.AdminStoragePath) 
                                                ?? panic("Could not get a capability to the admin")

        emit ContractInitialized()
    }
}
 