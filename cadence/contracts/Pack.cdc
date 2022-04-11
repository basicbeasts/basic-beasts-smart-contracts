import BasicBeasts from "./BasicBeasts.cdc"
import HunterScore from "./HunterScore.cdc"
import NonFungibleToken from "../flow/NonFungibleToken.cdc"
import FungibleToken from "../flow/FungibleToken.cdc"
import MetadataViews from "../flow/MetadataViews.cdc"

//TODO: Increase hunter score when unpacking pack.
//TODO: Finish contract
//TODO: Find out how to determine/manage NFT and fungible token types that are inserted into a pack.
//TODO: IMPORTANT Make Interface for NFT. So other's can't call the pack's functions. 
//TODO: Metadata standard: Display
/*
    If we want to mint multiple packs

    1. Have the beasts we want minted first along with tracking the right number of beast stock numbers
    - possible to keep track using this https://www.convertcsv.com/json-to-csv.htm and fetching admin collection
    2. Mint X number of packs 
    - possible
    3. Run one or more transactions to insert specific beasts based on beast.id
    get the arguments from a csv/json. IMPORTANT: Confirm that the right template is being inserted using a bool and 
    checking in post condition of the transaction. 
    (we know if the transaction contains a mythic diamond so in such a case we can leave out the post condition)
    All packs have a stock number. We make a transaction to ensure the right beast.id goes to the right pack and maybe check the beast if it has the right templateID.


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
    pub event PackOpened(id: UInt64, packTemplateID: UInt32, beastID: UInt64, beastTemplateID: UInt32, serialNumber: UInt32, sex: String, firstOwner: Address?)
    pub event PackTemplateCreated(packTemplateID: UInt32, name: String)
    pub event PackMinted(id: UInt64, name: String)

    // -----------------------------------------------------------------------
    // Named Paths
    // -----------------------------------------------------------------------
    
    pub let PackManagerStoragePath: StoragePath
    pub let PackManagerPublicPath: PublicPath
    pub let CollectionStoragePath: StoragePath
    pub let CollectionPublicPath: PublicPath
    pub let AdminStoragePath: StoragePath
    pub let AdminPrivatePath: PrivatePath

    // -----------------------------------------------------------------------
    // NonFungibleToken Standard Fields
    // -----------------------------------------------------------------------
    pub var totalSupply: UInt64

    access(self) var packTemplates: {UInt32: PackTemplate}
    access(self) var stockNumbers: [UInt32]
    access(self) var numberMintedPerPackTemplate: {UInt32: UInt32}

    pub struct PackTemplate {
        pub let packTemplateID: UInt32
        pub let name: String
        pub let image: String
        pub let description: String

        init(packTemplateID: UInt32, name: String, image: String, description: String) {
            pre {
                name != "": "Can't create PackTemplate: name can't be blank"
                image != "": "Can't create PackTemplate: image can't be blank"
                description != "": "Can't create PackTemplate: description can't be blank"
            }
            self.packTemplateID = packTemplateID
            self.name = name
            self.image = image
            self.description = description
        }
    }

    pub resource interface Public {
        pub let id: UInt64
        pub let serialNumber: UInt32
        pub let stockNumber: UInt32
        pub let packTemplate: PackTemplate
        pub var opened: Bool
        access(contract) var fungibleTokens: @[FungibleToken.Vault]
        access(contract) var beast: @{UInt64: BasicBeasts.NFT}
        pub fun isOpened(): Bool
        pub fun containsFungibleTokens(): Bool
        pub fun containsBeast(): Bool
        pub fun getNumberOfFungibleTokenVaults(): Int
        pub fun getNumberOfBeasts(): Int
    }

    pub resource NFT: NonFungibleToken.INFT, Public, MetadataViews.Resolver {
        pub let id: UInt64
        pub let serialNumber: UInt32
        pub let stockNumber: UInt32
        pub let packTemplate: PackTemplate
        pub var opened: Bool
        access(contract) var fungibleTokens: @[FungibleToken.Vault]
        access(contract) var beast: @{UInt64: BasicBeasts.NFT}

        init(stockNumber: UInt32, packTemplateID: UInt32) {
            pre {
                !Pack.stockNumbers.contains(stockNumber): "Can't mint Pack NFT: pack stock number has already been minted"
                Pack.packTemplates[packTemplateID] != nil: "Can't mint Pack NFT: packTemplate does not exist"
            }
            Pack.totalSupply = Pack.totalSupply + 1

            Pack.stockNumbers.append(stockNumber)

            Pack.numberMintedPerPackTemplate[packTemplateID] = Pack.numberMintedPerPackTemplate[packTemplateID]! + 1 

            self.serialNumber = Pack.numberMintedPerPackTemplate[packTemplateID]!

            self.id = self.uuid
            self.stockNumber = stockNumber
            self.packTemplate = Pack.packTemplates[packTemplateID]!
            self.opened = false
            self.fungibleTokens <- []
            self.beast <- {}
        }

        pub fun retrieveAllFungibleTokens(): @[FungibleToken.Vault] {
            pre {
                self.containsFungibleTokens(): "Can't retrieve fungible token vaults: Pack does not contain vaults"
            }
            var tokens: @[FungibleToken.Vault] <- []
            self.fungibleTokens <-> tokens

            return <- tokens
        }

        access(contract) fun updateIsOpened() {
            if(self.beast.keys.length == 0) {
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

        pub fun getNumberOfFungibleTokenVaults(): Int {
            return self.fungibleTokens.length
        } 

        pub fun getNumberOfBeasts(): Int {
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
					thumbnail: MetadataViews.IPFSFile(cid: self.packTemplate.image, path: nil)
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

    pub resource interface PublicPackManager {
        pub let id: UInt64
    }

    pub resource PackManager: PublicPackManager {
        pub let id: UInt64

        init() {
            self.id = self.uuid
        }

        // Increase Hunter Score when unpacking
        // Set firstOwner
        pub fun retrieveBeast(pack: @NFT): @BasicBeasts.Collection {
            pre {
                pack.containsBeast(): "Can't retrieve beast: Pack does not contain a beast"
                self.owner != nil: "Can't retrieve beast: self.owner is nil"
            }

            let keys = pack.beast.keys

            let beastCollection <- BasicBeasts.createEmptyCollection() as! @BasicBeasts.Collection

            let beastRef: &BasicBeasts.NFT = &pack.beast[keys[0]] as! &BasicBeasts.NFT

            let beast <- pack.beast.remove(key: keys[0])!

            beast.setFirstOwner(firstOwner: self.owner!.address)

            beastCollection.deposit(token: <- beast)

            let newBeastCollection <- HunterScore.increaseHunterScore(wallet: self.owner!.address, beasts: <- beastCollection)

            pack.updateIsOpened()

            if pack.isOpened() {
                emit PackOpened(id: pack.id, packTemplateID: pack.packTemplate.packTemplateID, beastID: beastRef.id, beastTemplateID: beastRef.getBeastTemplate().beastTemplateID, serialNumber: beastRef.serialNumber, sex: beastRef.sex, firstOwner: beastRef.getFirstOwner())
            }

            destroy pack

            return <- newBeastCollection
        }

    }

    // -----------------------------------------------------------------------
    // Admin Resource Functions
    //
    // Admin is a special authorization resource that 
    // allows the owner to perform important NFT functions
    // -----------------------------------------------------------------------
    pub resource Admin {

        pub fun createPackTemplate(packTemplateID: UInt32, name: String, image: String, description: String): UInt32 {
            pre {
                Pack.packTemplates[packTemplateID] == nil: "Can't create PackTemplate: Pack Template ID already exist"
            }
            var newPackTemplate = PackTemplate(packTemplateID: packTemplateID, name: name, image: image, description: description)
            
            Pack.packTemplates[packTemplateID] = newPackTemplate

            Pack.numberMintedPerPackTemplate[packTemplateID] = 0

            emit PackTemplateCreated(packTemplateID: newPackTemplate.packTemplateID, name: newPackTemplate.name)

            return newPackTemplate.packTemplateID
        }

        pub fun mintPack(stockNumber: UInt32, packTemplateID: UInt32): @Pack.NFT {
            let newPack: @Pack.NFT <- Pack.mintPack(stockNumber: stockNumber, packTemplateID: packTemplateID)

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
    access(account) fun mintPack(stockNumber: UInt32, packTemplateID: UInt32): @Pack.NFT {
            let newPack: @Pack.NFT <- create NFT(stockNumber: stockNumber, packTemplateID: packTemplateID)

            emit PackMinted(id: newPack.id, name: newPack.packTemplate.name)
            return <- newPack
    }
    // -----------------------------------------------------------------------
    // Public Functions
    // -----------------------------------------------------------------------
    pub fun createNewPackManager(): @PackManager {
            return <-create PackManager()
    }

    pub fun getAllPackTemplates(): {UInt32: PackTemplate} {
        return self.packTemplates
    }

    pub fun getPackTemplate(packTemplateID: UInt32): PackTemplate? {
        return self.packTemplates[packTemplateID]
    }

    pub fun getAllstockNumbers(): [UInt32] {
        return self.stockNumbers
    }

    pub fun getAllNumberMintedPerPackTemplate(): {UInt32: UInt32} {
        return self.numberMintedPerPackTemplate
    }

    pub fun getNumberMintedPerPackTemplate(packTemplateID: UInt32): UInt32? {
        return self.numberMintedPerPackTemplate[packTemplateID]
    }

    // -----------------------------------------------------------------------
    // NonFungibleToken Standard Functions
    // -----------------------------------------------------------------------
    pub fun createEmptyCollection(): @NonFungibleToken.Collection {
        return <-create self.Collection()
    }

    init() {
        // Set named paths
        self.PackManagerStoragePath = /storage/BasicBeastsPackManager
        self.PackManagerPublicPath = /public/BasicBeastsPackManager
        self.CollectionStoragePath = /storage/BasicBeastsPackCollection
        self.CollectionPublicPath = /public/BasicBeastsPackCollection
        self.AdminStoragePath = /storage/BasicBeastsPackAdmin
        self.AdminPrivatePath = /private/BasicBeastsPackAdminUpgrade

        // Initialize the fields
        self.totalSupply = 0
        self.packTemplates = {}
        self.stockNumbers = []
        self.numberMintedPerPackTemplate = {}

        // Put Admin in storage
        self.account.save(<-create Admin(), to: self.AdminStoragePath)

        self.account.link<&BasicBeasts.Admin>(
            self.AdminPrivatePath,
            target: self.AdminStoragePath
        ) ?? panic("Could not get a capability to the admin")

        emit ContractInitialized()
    }


}