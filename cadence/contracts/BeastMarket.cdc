/**
    BeastMarket.cdc

    Used for trading beasts. Only supports FUSD. Support one or more royalties.
**/

import FungibleToken from "../flow/FungibleToken.cdc"
import MetadataViews from "../flow/MetadataViews.cdc"
import FUSD from "../flow/FUSD.cdc"
import BasicBeasts from "./BasicBeasts.cdc"
import HunterScore from "./HunterScore.cdc"

pub contract BeastMarket {

    // -----------------------------------------------------------------------
    // BeastMarket Events
    // -----------------------------------------------------------------------
    pub event BeastListed(id: UInt64, price: UFix64, seller: Address?)
    pub event BeastPurchased(id: UInt64, price: UFix64, seller: Address?)
    pub event BeastWithdrawn(id: UInt64, owner: Address?)
    pub event NewHighestSale(price: UFix64)
    pub event RoyaltyPaid(address: Address, royaltyAmount: UFix64)

    // -----------------------------------------------------------------------
    // Named Paths
    // -----------------------------------------------------------------------
    pub let CollectionStoragePath: StoragePath
    pub let CollectionPublicPath: PublicPath

    // -----------------------------------------------------------------------
    // BeastMarket Fields
    // -----------------------------------------------------------------------
    pub var highestSale: UFix64
    access(self) var sellers: [Address]
    access(self) var royaltiesEarned: {Address: {UInt64: UFix64}}

    pub resource interface SalePublic {
        pub fun purchase(tokenID: UInt64, buyTokens: @FungibleToken.Vault, buyer: Address): @BasicBeasts.NFT {
            post {
                result.id == tokenID: "The ID of the withdrawn token must be the same as the requested ID"
            }
        }
        pub fun getPrice(tokenID: UInt64): UFix64?
        pub fun getIDs(): [UInt64]
        pub fun borrowBeast(id: UInt64): &BasicBeasts.NFT{BasicBeasts.Public}? {
            // If the result isn't nil, the id of the returned reference
            // should be the same as the argument to the function
            post {
                (result == nil) || (result?.id == id): 
                    "Cannot borrow Moment reference: The ID of the returned reference is incorrect"
            }
        }
        pub fun validateListing(tokenID: UInt64): Bool
    }

    pub resource SaleCollection: SalePublic {

        access(self) var ownerCollection: Capability<&BasicBeasts.Collection>
        access(self) var prices: {UInt64: UFix64}
        access(self) var ownerCapability: Capability<&FUSD.Vault{FungibleToken.Receiver}>

        init(ownerCollection: Capability<&BasicBeasts.Collection>,
              ownerCapability: Capability<&FUSD.Vault{FungibleToken.Receiver}>) {
            self.ownerCollection = ownerCollection
            self.prices = {}
            self.ownerCapability = ownerCapability
        }

        pub fun listForSale(tokenID: UInt64, price: UFix64) {
            pre {
                self.ownerCollection.borrow()!.borrowBeast(id: tokenID) != nil:
                    "Beast does not exist in the owner's collection"
            }

            self.prices[tokenID] = price

            // Add seller to list
            if(!BeastMarket.sellers.contains(self.owner!.address)) {
                BeastMarket.sellers.append(self.owner!.address)
            }
            
            emit BeastListed(id: tokenID, price: price, seller: self.owner?.address)
        }

        pub fun cancelSale(tokenID: UInt64) {
            if self.prices[tokenID] != nil {

                self.prices.remove(key: tokenID)

                self.prices[tokenID] = nil

                emit BeastWithdrawn(id: tokenID, owner: self.owner?.address)
            }
        }

        pub fun purchase(tokenID: UInt64, buyTokens: @FungibleToken.Vault, buyer: Address): @BasicBeasts.NFT {
            pre {
                self.prices[tokenID] != nil: "Can't purchase Beast: ID doesn't exist in this Sale Collection"
                buyTokens.balance == self.prices[tokenID]!: "Can't purchase Beast: Not enough tokens to buy the NFT!"
            }

            let price = self.prices[tokenID]!

            BeastMarket.checkHighestSale(price: price)

            self.prices[tokenID] = nil

            let boughtBeast <- self.ownerCollection.borrow()!.withdraw(withdrawID: tokenID) as! @BasicBeasts.NFT

            // Payout royalties
            //
            let royalties = (boughtBeast.resolveView(Type<MetadataViews.Royalties>()) as! MetadataViews.Royalties?)!

            for royalty in royalties.getRoyalties() {
                let beneficiaryCut <- buyTokens.withdraw(amount: price * royalty.cut)

                let address = royalty.receiver.address

                let receiverRef = getAccount(address).getCapability(/public/fusdReceiver)
                    .borrow<&FUSD.Vault{FungibleToken.Receiver}>()
                    ?? panic("Could not borrow receiver reference to the recipient's Vault")

                receiverRef.deposit(from: <-beneficiaryCut)

                // Save royalty earned data to contract
                BeastMarket.saveRoyalty(address: address, id: boughtBeast.id, royaltyAmount: price * royalty.cut)
            }

            self.ownerCapability.borrow()!
                .deposit(from: <-buyTokens)

            // Increase Hunter Score of Buyer
            //
            let beastCollection <- BasicBeasts.createEmptyCollection() as! @BasicBeasts.Collection

            beastCollection.deposit(token: <-boughtBeast)

            let newBeastCollection <- HunterScore.increaseHunterScore(wallet: buyer, beasts: <-beastCollection)

            let beast <- newBeastCollection.withdraw(withdrawID: tokenID) as! @BasicBeasts.NFT

            destroy newBeastCollection

            emit BeastPurchased(id: tokenID, price: price, seller: self.owner?.address)

            return <-beast

        }

        pub fun getPrice(tokenID: UInt64): UFix64? {
            if let price = self.prices[tokenID] {
                return price
            }
            return nil
        }

        pub fun getIDs(): [UInt64] {
            return self.prices.keys
        }

        pub fun borrowBeast(id: UInt64): &BasicBeasts.NFT{BasicBeasts.Public}? {
            if self.prices[id] != nil {
                let ref = self.ownerCollection.borrow()!.borrowBeast(id: id)
                return ref
            }
            return nil
        }

        // Handle ghost listings in case the ownerCollection no longer has the beast in the collection.
        pub fun validateListing(tokenID: UInt64): Bool {
            pre {
                self.prices[tokenID] != nil: "Can't purchase Beast: ID doesn't exist in this Sale Collection"
            }

            if(self.ownerCollection.borrow()!.borrowBeast(id: tokenID) == nil) {
                self.cancelSale(tokenID: tokenID)
                return false
            }

            return true
        }
    }

    access(account) fun saveRoyalty(address: Address, id: UInt64, royaltyAmount: UFix64) {
        if(BeastMarket.royaltiesEarned[address] == nil) {
            BeastMarket.royaltiesEarned[address] = {}
        }

        if(BeastMarket.royaltiesEarned[address]![id] == nil) {
            let royaltiesFromBeast = BeastMarket.royaltiesEarned[address]!
            royaltiesFromBeast[id] = royaltyAmount
        } else {
            let royaltiesFromBeast = BeastMarket.royaltiesEarned[address]!
            royaltiesFromBeast[id] = royaltiesFromBeast[id]! + royaltyAmount
        }

        emit RoyaltyPaid(address: address, royaltyAmount: royaltyAmount)
    }

    access(account) fun checkHighestSale(price: UFix64) {
        if(price > BeastMarket.highestSale) {
            BeastMarket.highestSale = price
            
            emit NewHighestSale(price: price)
        }
    }

    pub fun createSaleCollection(ownerCollection: Capability<&BasicBeasts.Collection>, ownerCapability: Capability<&FUSD.Vault{FungibleToken.Receiver}>): @SaleCollection {
        return <- create SaleCollection(ownerCollection: ownerCollection, ownerCapability: ownerCapability)
    }

    pub fun getSellers(): [Address] {
        return BeastMarket.sellers
    }

    pub fun getAllRoyaltiesEarned(): {Address: {UInt64: UFix64}} {
        return BeastMarket.royaltiesEarned
    }

    pub fun getRoyaltiesEarned(address: Address): {UInt64: UFix64}? {
        return BeastMarket.royaltiesEarned[address]
    }

    init() {
        // Set named paths
        self.CollectionStoragePath = /storage/BasicBeastsSaleCollection
        self.CollectionPublicPath = /public/BasicBeastsSaleCollection

        // Initialize the fields
        self.highestSale = 0.0
        self.sellers = []
        self.royaltiesEarned = {}

        if self.account.borrow<&FUSD.Vault>(from: /storage/fusdVault) == nil {
            // Create a new FUSD Vault and put it in storage
            self.account.save(<-FUSD.createEmptyVault(), to: /storage/fusdVault)

            // Create a public capability to the Vault that only exposes
            // the deposit function through the Receiver interface
            self.account.link<&FUSD.Vault{FungibleToken.Receiver}>(
                /public/fusdReceiver,
                target: /storage/fusdVault
            )

            // Create a public capability to the Vault that only exposes
            // the balance field through the Balance interface
            self.account.link<&FUSD.Vault{FungibleToken.Balance}>(
                /public/fusdBalance,
                target: /storage/fusdVault
            )
        }

    }

}
 