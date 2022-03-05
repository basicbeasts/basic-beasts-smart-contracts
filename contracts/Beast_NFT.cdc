import NonFungibleToken from "../Flow/NonFungibleToken.cdc"

pub contract Beast_NFT: NonFungibleToken {

    // -----------------------------------------------------------------------
    // NonFungibleToken Standard Events
    // -----------------------------------------------------------------------
    pub event ContractInitialized()
    //TODO

    // -----------------------------------------------------------------------
    // Beast_NFT Events
    // -----------------------------------------------------------------------
    //TODO

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
    // Beast_NFT Fields
    // -----------------------------------------------------------------------
    //TODO

    // Generation that a BeastTemplate belongs to.
    // Generation is a concept that indicates a group of BeastTemplates through time.
    // Many BeastTemplates can exist at a time, but only one generation.
    pub var currentGeneration: UInt32

    // Variable size dictionary of beastTemplate structs
    access(self) var beastTemplates: {UInt32: BeastTemplate}

    // Variable size dictionary of evolutionPairs
    //
    // Key = beastTemplateID of lower star level 
    // that can evolve into the higher star level
    //
    // Value = beastTemplateID of higher star level
    //
    access(self) var evolutionPairs: {UInt32: UInt32}

    access(self) var retired: {UInt32: Bool}

    access(self) var numOfMintedPerBeastTemplate: {UInt32: UInt32}

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

        pub let maxMintAllowed: UInt32

        pub let ultimateSkill: String

        pub let basicSkills: [String]

        pub let elements: [String]

        pub let data: {String: String}

        init(beastTemplateID: UInt32) {
            pre {
                Beast_NFT.beastTemplates.keys.contains(beastTemplateID) == false: "The BeastTemplate has already been added to the Beast_NFT Contract."
            }
            self.beastTemplateID = beastTemplateID
            self.generation = Beast_NFT.currentGeneration

            // TODO emit BeastTemplateCreated(...)
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

        pub fun createNewAdmin(): @Admin {
            return <-create Admin()
        }

    }

    // -----------------------------------------------------------------------
    // Public Functions
    // -----------------------------------------------------------------------

    

    // -----------------------------------------------------------------------
    // NonFungibleToken Standard Functions
    // -----------------------------------------------------------------------

    pub fun createEmptyCollection(): @NonFungibleToken.Collection {
        return <-create self.Collection()
    }

    init() {
        // Set named paths
        self.CollectionStoragePath = /storage/Beast_NFTCollection
        self.CollectionPublicPath = /public/Beast_NFTCollection
        self.AdminStoragePath = /storage/Beast_NFTAdmin
        self.AdminPrivatePath = /private/Beast_NFTAdminUpgrade

        // Initialize the fields
        self.totalSupply = 0
        self.currentGeneration = 1
        self.beastTemplates = {}
        self.evolutionPairs = {}
        self.retired = {}
        self.numOfMintedPerBeastTemplate = {}

        // Put Admin in storage
        self.account.save(<-create Admin(), to: self.AdminStoragePath)

        self.account.link<&Beast_NFT.Admin>(
            self.AdminPrivatePath,
            target: self.AdminStoragePath
        ) ?? panic("Could not get a capability to the admin")

        emit ContractInitialized()
    }
}
