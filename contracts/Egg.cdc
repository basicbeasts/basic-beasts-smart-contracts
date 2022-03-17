import NonFungibleToken from "../Flow/NonFungibleToken.cdc"
import BasicBeasts from "./BasicBeasts.cdc"
import HunterScore from "./HunterScore.cdc"

//TODO: Events
//TODO: Named paths
//TODO: Maybe Admin resource. To change Timer so it's not always 24 hours

pub contract Egg: NonFungibleToken {

    // -----------------------------------------------------------------------
    // NonFungibleToken Standard Events
    // -----------------------------------------------------------------------
    pub event ContractInitialized()
    pub event Withdraw(id: UInt64, from: Address?)
    pub event Deposit(id: UInt64, to: Address?)

    pub event Hatch(id: UInt64, hatchedBy: Address?)

    // -----------------------------------------------------------------------
    // NonFungibleToken Standard Fields
    // -----------------------------------------------------------------------
    pub var totalSupply: UInt64

    pub struct IncubationTimer {

        pub let incubateDateEnding: UFix64

        init(incubateDateEnding: UFix64) {
            self.incubateDateEnding = incubateDateEnding
        }
    }

    //TODO test if beast can be withdrawn outside of hatch() function
    pub resource NFT: NonFungibleToken.INFT {
        pub let id: UInt64
        pub let matron: BasicBeasts.BeastNftStruct
        pub let sire: BasicBeasts.BeastNftStruct
        access(self) var beast: @{UInt64: BasicBeasts.NFT}
        access(self) var incubationTimer: IncubationTimer?
        access(self) var empty: Bool

        init(matron: BasicBeasts.BeastNftStruct, sire: BasicBeasts.BeastNftStruct, beast: @BasicBeasts.NFT) {
            
            Egg.totalSupply = Egg.totalSupply + 1

            self.id = self.uuid
            self.matron = matron
            self.sire = sire
            self.beast <- {beast.id:<- beast}
            self.incubationTimer = nil
            self.empty = false
        }

        pub fun incubate(beastRef: &BasicBeasts.NFT) {
            pre {
                self.isHatchable() == false: "Cannot incubate egg: Egg is already hatchable"
                beastRef.getBeastTemplate().elements.contains("Fire"): "Cannot incubate egg: Beast.NFT with the element Fire must be used"
            }
            let dateEnding = getCurrentBlock().timestamp + 86400.0

            self.incubationTimer = IncubationTimer(incubateDateEnding: dateEnding)
        }

        pub fun hatch(wallet: Address): @BasicBeasts.NFT {
            pre {
                self.isHatchable(): "Cannot hatch egg: Egg must be incubated first"
                self.empty == false: "Cannot hatch egg: Egg is empty"
                self.beast.length > 0: "Cannot hatch egg: Egg has no beast"
            }
            let keys = self.beast.keys

            var beastCollection <- BasicBeasts.createEmptyCollection() as! @BasicBeasts.Collection

            beastCollection.deposit(token: <- self.beast.remove(key: keys[0])!)

            var newBeastCollection <- HunterScore.increaseHunterScore(wallet: wallet, beasts: <- beastCollection)

            let IDs = newBeastCollection.getIDs()

            let newBeast <- newBeastCollection.withdraw(withdrawID: IDs[0]) as! @BasicBeasts.NFT

            destroy newBeastCollection

            self.empty = true

            return <- newBeast
        }

        pub fun isHatchable(): Bool {
            if(self.incubationTimer == nil) {
                return false
            }
            return getCurrentBlock().timestamp >= self.incubationTimer!.incubateDateEnding
        }

        pub fun isEmpty(): Bool {
            return self.isEmpty()
        }

        destroy() {
            destroy self.beast
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
        self.totalSupply = 0
    }
}