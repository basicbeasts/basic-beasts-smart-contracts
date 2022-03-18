import NonFungibleToken from "../Flow/NonFungibleToken.cdc"
import BasicBeasts from "./BasicBeasts.cdc"
import HunterScore from "./HunterScore.cdc"

pub contract Egg: NonFungibleToken {

    // -----------------------------------------------------------------------
    // NonFungibleToken Standard Events
    // -----------------------------------------------------------------------
    pub event ContractInitialized()
    pub event Withdraw(id: UInt64, from: Address?)
    pub event Deposit(id: UInt64, to: Address?)

    // -----------------------------------------------------------------------
    // Egg Events
    // -----------------------------------------------------------------------
    pub event IncubationStarted(id: UInt64, incubationDateEnding: UFix64)
    pub event Hatch(id: UInt64, beastTemplateID: UInt32, hatchedBy: Address?)

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
    pub var incubationDuration: UFix64
    pub var name: String
    access(self) var images: {String: String}

    pub struct IncubationTimer {

        pub let incubationDateEnding: UFix64

        init(incubationDateEnding: UFix64) {
            self.incubationDateEnding = incubationDateEnding
        }
    }

    //TODO test if beast can be withdrawn outside of hatch() function somehow
    pub resource NFT: NonFungibleToken.INFT {

        pub let id: UInt64

        pub let name: String

        pub let image: String

        pub let matron: BasicBeasts.BeastNftStruct

        pub let sire: BasicBeasts.BeastNftStruct

        access(self) var beast: @{UInt64: BasicBeasts.NFT}

        access(self) var incubationTimer: IncubationTimer?

        init(matron: BasicBeasts.BeastNftStruct, sire: BasicBeasts.BeastNftStruct, beast: @BasicBeasts.NFT) {
            
            Egg.totalSupply = Egg.totalSupply + 1

            self.id = self.uuid

            self.name = Egg.name.concat(" #").concat(self.uuid.toString())
            
            if let image = Egg.images[beast.getBeastTemplate().elements[0]] {
                self.image = image
            } else {
                self.image = Egg.images["Default"]!
            }
            
            self.matron = matron
            self.sire = sire
            self.beast <- {beast.id:<- beast}
            self.incubationTimer = nil
        }

        //TODO check if any ref just can be used. If that is the case then we need to move the whole beast NFT out to ensure that it is the user
        pub fun incubate(beast: @BasicBeasts.NFT): @BasicBeasts.NFT {
            pre {
                self.isHatchable() == false: "Cannot incubate egg: Egg is already hatchable"
                beast.getBeastTemplate().elements.contains("Fire"): "Cannot incubate egg: Beast.NFT with the element Fire must be used"
            }
            let dateEnding = getCurrentBlock().timestamp + Egg.incubationDuration

            self.incubationTimer = IncubationTimer(incubationDateEnding: dateEnding)

            emit IncubationStarted(id: self.id, incubationDateEnding: dateEnding)

            return <- beast
        }

        pub fun hatch(): @BasicBeasts.NFT {
            pre {
                self.isHatchable(): "Cannot hatch egg: Egg must be incubated first"
                self.isEmpty() == false: "Cannot hatch egg: Egg is empty"
                self.owner != nil: "Can't hatch egg: self.owner is nil"
            }
            let keys = self.beast.keys

            var beastCollection <- BasicBeasts.createEmptyCollection() as! @BasicBeasts.Collection

            beastCollection.deposit(token: <- self.beast.remove(key: keys[0])!)

            var newBeastCollection <- HunterScore.increaseHunterScore(wallet: self.owner!.address, beasts: <- beastCollection)

            let IDs = newBeastCollection.getIDs()

            let newBeast <- newBeastCollection.withdraw(withdrawID: IDs[0]) as! @BasicBeasts.NFT

            newBeast.setFirstOwner(firstOwner: self.owner!.address)

            destroy newBeastCollection

            emit Hatch(id: self.id, beastTemplateID: newBeast.getBeastTemplate().beastTemplateID, hatchedBy: self.owner!.address)

            return <- newBeast
        }

        pub fun isHatchable(): Bool {
            if(self.incubationTimer == nil) {
                return false
            }
            return getCurrentBlock().timestamp >= self.incubationTimer!.incubationDateEnding
        }

        pub fun isEmpty(): Bool {
            return self.beast.length == 0
        }

        destroy() {
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

        pub fun setTimer(durationInSeconds: UFix64) {
            Egg.incubationDuration = durationInSeconds
        }

        pub fun changeEggName(name: String) {
            pre {
                name != "": "Can't change egg name: Name can't be blank"
            }
            Egg.name = name
        }

        pub fun changeEggImage(element: String, image: String) {
            pre {
                element != "": "Can't change egg image for element: Element can't be blank"
                image != "": "Can't change egg image for element: Image can't be blank"
            }
            Egg.images.insert(key: element, image)
        }

        pub fun createNewAdmin(): @Admin {
            return <-create Admin()
        }

    }

    pub resource interface EggCollectionPublic {
        pub fun deposit(token: @NonFungibleToken.NFT)
        pub fun getIDs(): [UInt64]
        pub fun borrowNFT(id: UInt64): &NonFungibleToken.NFT
        pub fun borrowEgg(id: UInt64): &Egg.NFT? { 
            post {
                (result == nil) || (result?.id == id): 
                    "Cannot borrow Egg reference: The ID of the returned reference is incorrect"
            }
        }

    }

    pub resource Collection: EggCollectionPublic, NonFungibleToken.Provider, NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic {

        pub var ownedNFTs: @{UInt64: NonFungibleToken.NFT}

        init() {
            self.ownedNFTs <- {}
        }

        pub fun withdraw(withdrawID: UInt64): @NonFungibleToken.NFT {
            let token <- self.ownedNFTs.remove(key: withdrawID) 
                ?? panic("Cannot withdraw: The Egg does not exist in the Collection")
            emit Withdraw(id: token.id, from: self.owner?.address)
            return <-token
        }

        pub fun deposit(token: @NonFungibleToken.NFT) {
            let token <- token as! @Egg.NFT
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

        pub fun borrowEgg(id: UInt64): &Egg.NFT? {
            if self.ownedNFTs[id] != nil { 
                let ref = &self.ownedNFTs[id] as auth &NonFungibleToken.NFT
                return ref as! &Egg.NFT
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

    access(account) fun mintEgg(matron: BasicBeasts.BeastNftStruct, sire: BasicBeasts.BeastNftStruct, beast: @BasicBeasts.NFT): @Egg.NFT {

        let newEgg: @NFT <- create NFT(matron: matron, sire: sire, beast: <-beast)

        return <- newEgg
    }

    // -----------------------------------------------------------------------
    // NonFungibleToken Standard Functions
    // -----------------------------------------------------------------------

    pub fun createEmptyCollection(): @NonFungibleToken.Collection {
        return <-create self.Collection()
    }

    init() {
        // Set named paths
        self.CollectionStoragePath = /storage/BasicBeastsEggCollection
        self.CollectionPublicPath = /public/BasicBeastsEggCollection
        self.AdminStoragePath = /storage/BasicBeastsEggAdmin
        self.AdminPrivatePath = /private/BasicBeastsEggAdminUpgrade

        // Initialize the fields
        self.totalSupply = 0
        // Initizalize incubationDuration to 24 hours in seconds
        self.incubationDuration = 86400.0
        self.name = "Beast Egg"
        self.images = {"Default":"https://gateway.pinata.cloud/ipfs/QmfWreQjNHwtStSHJZkZtuvuvqyWbCJbZhdhTMxtvWApHh"}

        // Put a new Collection in storage
        self.account.save<@Collection>(<- create Collection(), to: self.CollectionStoragePath)

        // Create a public capability for the Collection
        self.account.link<&Collection{EggCollectionPublic}>(self.CollectionPublicPath, target: self.CollectionStoragePath)

        // Put Admin in storage
        self.account.save(<-create Admin(), to: self.AdminStoragePath)

        self.account.link<&Egg.Admin>(
            self.AdminPrivatePath,
            target: self.AdminStoragePath
        ) ?? panic("Could not get a capability to the admin")

        emit ContractInitialized()
    }
}