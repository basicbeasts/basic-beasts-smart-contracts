import BasicBeasts from "./BasicBeasts.cdc"
import HunterScore from "./HunterScore.cdc"
import NonFungibleToken from "../flow/NonFungibleToken.cdc"
import FungibleToken from "../flow/FungibleToken.cdc"
import MetadataViews from "../flow/MetadataViews.cdc"

//TODO: Increase hunter score when unpacking pack.
//TODO: Find out how to determine/manage NFT and fungible token types that are inserted into a pack.
//TODO: IMPORTANT Make Interface for NFT. So other's can't call the pack's functions. 
/*
    If we want to mint multiple packs

    1. Have the beasts we want minted first along with tracking the right number of beast serial numbers
    - possible to keep track using this https://www.convertcsv.com/json-to-csv.htm and fetching admin collection
    2. Mint X number of packs 
    - possible
    3. Run one or more transactions to insert specific beasts based on beast.id
    get the arguments from a csv/json. IMPORTANT: Confirm that the right template is being inserted using a bool and 
    checking in post condition of the transaction. 
    (we know if the transaction contains a mythic diamond so in such a case we can leave out the post condition)
    All packs have a serial number. We make a transaction to ensure the right beast.id goes to the right pack and maybe check the beast if it has the right templateID.


 */
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
    access(self) var serialNumbers: [UInt32]

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

    pub resource interface Public {
        pub let id: UInt64
        pub let serialNumber: UInt32
        pub let packTemplate: PackTemplate
        pub var opened: Bool
        pub var retrievedBeastNftData: BasicBeasts.BeastNftStruct?
        access(contract) var fungibleTokens: @[FungibleToken.Vault]
        access(contract) var beast: @{UInt64: BasicBeasts.NFT}
        pub fun isOpened(): Bool
        pub fun containsFungibleTokens(): Bool
        pub fun containsBeast(): Bool
        pub fun getNumOfFungibleTokenVaults(): Int
        pub fun getNumOfBeasts(): Int
    }

    pub resource NFT: NonFungibleToken.INFT, Public, MetadataViews.Resolver {

        pub let id: UInt64
        pub let serialNumber: UInt32
        pub let packTemplate: PackTemplate
        pub var opened: Bool
        pub var retrievedBeastNftData: BasicBeasts.BeastNftStruct?
        access(contract) var fungibleTokens: @[FungibleToken.Vault]
        access(contract) var beast: @{UInt64: BasicBeasts.NFT}

        init(serialNumber: UInt32, packTemplateID: UInt32) {
            pre {
                !Pack.serialNumbers.contains(serialNumber): "Can't mint Pack NFT: pack serial has already been minted"
                Pack.packTemplates[packTemplateID] != nil: "Can't mint Pack NFT: packTemplate does not exist"
            }
            Pack.totalSupply = Pack.totalSupply + 1
            self.id = self.uuid
            self.serialNumber = serialNumber
            self.packTemplate = Pack.packTemplates[packTemplateID]!
            self.opened = false
            self.retrievedBeastNftData = nil
            self.fungibleTokens <- []
            self.beast <- {}

            Pack.serialNumbers.append(serialNumber)
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

        pub fun getViews(): [Type] {
			return [
			Type<MetadataViews.Display>()
			]
		}

        pub fun resolveView(_ view: Type): AnyStruct? {
			switch view {
			case Type<MetadataViews.Display>():
				return MetadataViews.Display(
					name: self.packTemplate.name,
					description: self.packTemplate.description,
					thumbnail: MetadataViews.IPFSFile(cid: "", path: nil)
				)
		    }
			return nil
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
        pub fun mintPack(serialNumber: UInt32, packTemplateID: UInt32): @Pack.NFT {
            let newPack: @Pack.NFT <- Pack.mintPack(serialNumber: serialNumber, packTemplateID: packTemplateID)

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
        pub fun borrowPack(id: UInt64): &Pack.NFT{Public}? { 
            post {
                (result == nil) || (result?.id == id): 
                    "Cannot borrow Pack reference: The ID of the returned reference is incorrect"
            }
        }

    }

    pub resource Collection: PackCollectionPublic, NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic, MetadataViews.ResolverCollection {

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

        pub fun borrowPack(id: UInt64): &Pack.NFT{Public}? {
            if self.ownedNFTs[id] != nil { 
                let ref = &self.ownedNFTs[id] as auth &NonFungibleToken.NFT
                return ref as! &Pack.NFT
            } else {
                return nil
            }
        }

        pub fun borrowEntirePack(id: UInt64): &Pack.NFT? {
            if self.ownedNFTs[id] != nil { 
                let ref = &self.ownedNFTs[id] as auth &NonFungibleToken.NFT
                return ref as! &Pack.NFT
            } else {
                return nil
            }
        }

        pub fun borrowViewResolver(id: UInt64): &AnyResource{MetadataViews.Resolver} {
			let nft = &self.ownedNFTs[id] as auth &NonFungibleToken.NFT
			let packNFT = nft as! &Pack.NFT
			return packNFT 
		}

        destroy() {
            destroy self.ownedNFTs
        }
    }

    // -----------------------------------------------------------------------
    // Access(Account) Functions
    // -----------------------------------------------------------------------
    access(account) fun mintPack(serialNumber: UInt32, packTemplateID: UInt32): @Pack.NFT {
            let newPack: @Pack.NFT <- create NFT(serialNumber: serialNumber, packTemplateID: packTemplateID)
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

    pub fun getAllSerialNumbers(): [UInt32] {
        return self.serialNumbers
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
        self.serialNumbers = []

        // Put Admin in storage
        self.account.save(<-create Admin(), to: self.AdminStoragePath)

        self.account.link<&BasicBeasts.Admin>(
            self.AdminPrivatePath,
            target: self.AdminStoragePath
        ) ?? panic("Could not get a capability to the admin")

        emit ContractInitialized()
    }


}