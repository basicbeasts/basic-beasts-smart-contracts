import BasicBeasts from "./BasicBeasts.cdc"
import NonFungibleToken from "../flow/NonFungibleToken.cdc"
import FungibleToken from "../flow/FungibleToken.cdc"
import HunterScore from "./HunterScore.cdc"

//TODO: Increase hunter score when unpacking pack.
//TODO: Find out how to determine/manage NFT and fungible token types that are inserted into a pack.
pub contract Pack: NonFungibleToken {

    // -----------------------------------------------------------------------
    // NonFungibleToken Standard Events
    // -----------------------------------------------------------------------
    pub event ContractInitialized()
    pub event Withdraw(id: UInt64, from: Address?)
    pub event Deposit(id: UInt64, to: Address?)

    // -----------------------------------------------------------------------
    // Pack Events
    // -----------------------------------------------------------------------
    pub event PackOpened(id: UInt64, packTemplateID: UInt32)
    pub event PackTemplateCreated(packTemplateID: UInt32, name: String)
    pub event PackMinted(id: UInt64, name: String)

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
    access(self) var packTemplates: {UInt32: PackTemplate}

    pub struct PackTemplate {
        pub let packTemplateID: UInt32
        pub let name: String
        pub let image: String
        pub let description: String

        init(packTemplateID: UInt32, name: String, image: String, description: String) {
            self.packTemplateID = packTemplateID
            self.name = name
            self.image = image
            self.description = description
        }
    }

    pub resource NFT: NonFungibleToken.INFT {

        pub let id: UInt64
        pub let packTemplate: PackTemplate
        pub var opened: Bool
        pub var retrievedBeastNftData: BasicBeasts.BeastNftStruct?
        access(contract) var fungibleTokens: @[FungibleToken.Vault]
        access(contract) var beast: @{UInt64: BasicBeasts.NFT}

        init(packTemplateID: UInt32) {
            pre {
                Pack.packTemplates[packTemplateID] != nil: "Can't mint Pack NFT: packTemplate does not exist"
            }
            Pack.totalSupply = Pack.totalSupply + 1
            self.id = self.uuid
            self.packTemplate = Pack.packTemplates[packTemplateID]!
            self.opened = false
            self.retrievedBeastNftData = nil
            self.fungibleTokens <- []
            self.beast <- {}
        }

        pub fun retrieveAllFungibleTokens(): @[FungibleToken.Vault] {
            pre {
                self.containsFungibleTokens(): "Can't retrieve fungible token vaults: Pack does not contain vaults"
            }
            var tokens: @[FungibleToken.Vault] <- []
            self.fungibleTokens <-> tokens
            self.updateIsOpened()

            if self.isOpened() {
                emit PackOpened(id: self.id, packTemplateID: self.packTemplate.packTemplateID)
            }

            return <- tokens
        }

        // Increase Hunter Score when unpacking
        // Set firstOwner
        pub fun retrieveBeast(): @BasicBeasts.Collection {
            pre {
                self.containsBeast(): "Can't retrieve beast: Pack does not contain a beast"
                self.owner != nil: "Can't retrieve beast: self.owner is nil"
            }

            let keys = self.beast.keys

            let beastCollection <- BasicBeasts.createEmptyCollection() as! @BasicBeasts.Collection

            let beastRef: &BasicBeasts.NFT = &self.beast[keys[0]] as! &BasicBeasts.NFT

            let beast <- self.beast.remove(key: keys[0])!

            beast.setFirstOwner(firstOwner: self.owner!.address)

            beastCollection.deposit(token: <- beast)

            let newBeastCollection <- HunterScore.increaseHunterScore(wallet: self.owner!.address, beasts: <- beastCollection)

            self.retrievedBeastNftData = BasicBeasts.BeastNftStruct(
                                                id: beastRef.id, 
                                                serialNumber: beastRef.serialNumber, 
                                                sex: beastRef.sex, 
                                                beastTemplateID: beastRef.getBeastTemplate().beastTemplateID, 
                                                firstOwner: beastRef.getFirstOwner()
                                                )

            self.updateIsOpened()

            if self.isOpened() {
                emit PackOpened(id: self.id, packTemplateID: self.packTemplate.packTemplateID)
            }

            return <- newBeastCollection
        }

        access(self) fun updateIsOpened() {
            if(self.fungibleTokens.length == 0 && self.beast.keys.length == 0) {
                self.opened = true
            }
        }

        pub fun isOpened(): Bool {
            return self.opened
        }

        pub fun containsFungibleTokens(): Bool {
            return self.fungibleTokens.length > 0
        }

        pub fun containsBeast(): Bool {
            return self.beast.keys.length > 0
        }

        pub fun getNumOfFungibleTokenVaults(): Int {
            return self.fungibleTokens.length
        } 

        pub fun getNumOfBeasts(): Int {
            return self.beast.keys.length
        }

        destroy() {
            assert(self.fungibleTokens.length == 0, message: "Can't destroy Pack with fungible tokens within")
            assert(self.beast.keys.length == 0, message: "Can't destroy Pack with Beasts within")
            destroy self.fungibleTokens
            destroy self.beast
        }

    }

    // -----------------------------------------------------------------------
    // Admin Resource Functions
    //
    // Admin is a special authorization resource that 
    // allows the owner to perform important NFT functions
    // -----------------------------------------------------------------------
    pub resource Admin {

        pub fun createPackTemplate(packTemplateID: UInt32, name: String, image: String, description: String) {
            pre {
                Pack.packTemplates[packTemplateID] == nil: "Can't create PackTemplate: Pack Template ID already exist"
            }

            emit PackTemplateCreated(packTemplateID: packTemplateID, name: name)
        }

        // TODO: Check if other accounts can mint by having an admin resource.
        // They should be able to
        pub fun mintPack(packTemplateID: UInt32): @Pack.NFT {
            let newPack: @Pack.NFT <- Pack.mintPack(packTemplateID: packTemplateID)

            emit PackMinted(id: newPack.id, name: newPack.packTemplate.name)

            return <- newPack
        }

        pub fun insertBeast(pack: @Pack.NFT, beast: @BasicBeasts.NFT): @Pack.NFT {
            pre {
                pack.beast.keys.length == 0: "Can't insert Beast into Pack: Pack already contain a Beast"
                !pack.isOpened(): "Can't insert Beast into Pack: Pack has already been opened"
            }
            let id = beast.id
            pack.beast[id] <-! beast
            return <- pack
        }

        pub fun insertFungible(pack: @Pack.NFT, vault: @FungibleToken.Vault): @Pack.NFT {
            pack.fungibleTokens.append(<-vault)
            return <- pack
        }

        pub fun createNewAdmin(): @Admin {
            return <-create Admin()
        }

    }

    pub resource interface PackCollectionPublic {
        pub fun deposit(token: @NonFungibleToken.NFT)
        pub fun getIDs(): [UInt64]
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT
        pub fun borrowPack(id: UInt64): &Pack.NFT? { 
            post {
                (result == nil) || (result?.id == id): 
                    "Cannot borrow Pack reference: The ID of the returned reference is incorrect"
            }
        }

    }

    pub resource Collection: PackCollectionPublic, NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic {

        pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

        init() {
            self.ownedNFTs <- {}
        }

        pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
            let token <- self.ownedNFTs.remove(key: withdrawID) 
                ?? panic("Cannot withdraw: The Pack does not exist in the Collection")
            emit Withdraw(id: token.id, from: self.owner?.address)
            return <-token
        }

        pub fun deposit(token: @NonFungibleToken.NFT) {
            let token <- token as! @Pack.NFT
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

        pub fun borrowPack(id: UInt64): &Pack.NFT? {
            if self.ownedNFTs[id] != nil { 
                let ref = &self.ownedNFTs[id] as auth &NonFungibleToken.NFT
                return ref as! &Pack.NFT
            } else {
                return nil
            }
        }

        destroy() {
            destroy self.ownedNFTs
        }
    }

    // -----------------------------------------------------------------------
    // Access(Account) Functions
    // -----------------------------------------------------------------------
    access(account) fun mintPack(packTemplateID: UInt32): @Pack.NFT {
            let newPack: @Pack.NFT <- create NFT(packTemplateID: packTemplateID)
            return <- newPack
    }
    // -----------------------------------------------------------------------
    // Public Functions
    // -----------------------------------------------------------------------
    pub fun getAllPackTemplate(): {UInt32: PackTemplate} {
        return self.packTemplates
    }

    pub fun getPackTemplate(packTemplateID: UInt32): PackTemplate? {
        return self.packTemplates[packTemplateID]
    }

    // -----------------------------------------------------------------------
    // NonFungibleToken Standard Functions
    // -----------------------------------------------------------------------
    pub fun createEmptyCollection(): @NonFungibleToken.Collection {
        return <-create self.Collection()
    }

    init() {
        // Set named paths
        self.CollectionStoragePath = /storage/BasicBeastsPackCollection
        self.CollectionPublicPath = /public/BasicBeastsPackCollection
        self.AdminStoragePath = /storage/BasicBeastsPackAdmin
        self.AdminPrivatePath = /private/BasicBeastsPackAdminUpgrade

        // Initialize the fields
        self.totalSupply = 0
        self.packTemplates = {}

        // Put a new Collection in storage
        self.account.save<@Collection>(<- create Collection(), to: self.CollectionStoragePath)

        // Create a public capability for the Collection
        self.account.link<&Collection{PackCollectionPublic}>(self.CollectionPublicPath, target: self.CollectionStoragePath)

        // Put Admin in storage
        self.account.save(<-create Admin(), to: self.AdminStoragePath)

        self.account.link<&BasicBeasts.Admin>(
            self.AdminPrivatePath,
            target: self.AdminStoragePath
        ) ?? panic("Could not get a capability to the admin")

        emit ContractInitialized()
    }


}