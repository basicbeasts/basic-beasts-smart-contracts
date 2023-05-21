import FungibleToken from "../flow/FungibleToken.cdc"
import MetadataViews from "../flow/MetadataViews.cdc"
import FUSD from "../flow/FUSD.cdc"
import BasicBeasts from "./BasicBeasts.cdc"
import HunterScore from "./HunterScore.cdc"
import BeastMarket from "./BeastMarket.cdc"

pub contract BeastOffers {

    // -----------------------------------------------------------------------
    // BeastOffers Events
    // -----------------------------------------------------------------------
    pub event BeastOffersInitialized()
    pub event OfferAvailable(
        offerAddress: Address,
        offerID: UInt64,
        offerAmount: UFix64,
        beastID: UInt64
    )
    // OfferCompleted
    // The Offer has been resolved. The offer has either been accepted
    //  by the NFT owner, or the offer has been removed and destroyed.
    //
    pub event OfferCompleted(
        purchased: Bool,
        acceptingAddress: Address?,
        offerAddress: Address,
        offerID: UInt64,
        offerAmount: UFix64,
        beastID: UInt64?,
    )
    pub event RoyaltySkipped(address: Address, royaltyAmount: UFix64)
    pub event OfferCollectionDestroyed(OfferCollectionID: UInt64)
    // -----------------------------------------------------------------------
    // Named Paths
    // -----------------------------------------------------------------------
    pub let CollectionStoragePath: StoragePath
    pub let CollectionPublicPath: PublicPath

    // -----------------------------------------------------------------------
    // BeastMarket Fields
    // -----------------------------------------------------------------------
    access(self) var offerors: [Address]

    pub struct OfferDetails {
        pub let offerID: UInt64
        pub let offerAmount: UFix64
        pub let beastID: UInt64
        pub var purchased: Bool

        // setToPurchased
        // Irreversibly set this offer as purchased.
        //
        access(contract) fun setToPurchased() {
            self.purchased = true
        }

        init(offerID: UInt64, offerAmount: UFix64, beastID: UInt64) {
            self.offerID = offerID
            self.offerAmount = offerAmount
            self.beastID = beastID
            self.purchased = false
        }
    }

    pub resource interface OfferPublic {
        pub fun accept(
            beast: @BasicBeasts.NFT, 
            receiverCapability: Capability<&FUSD.Vault{FungibleToken.Receiver}>
            )
        pub fun getDetails(): OfferDetails
    }

    pub resource Offer: OfferPublic {
        access(self) let details: OfferDetails
        access(contract) let vaultRefCapability: Capability<&FUSD.Vault{FungibleToken.Provider, FungibleToken.Balance}>
        access(contract) let beastReceiverCapability: Capability<&BasicBeasts.Collection{BasicBeasts.BeastCollectionPublic}>

        init(
            vaultRefCapability: Capability<&FUSD.Vault{FungibleToken.Provider, FungibleToken.Balance}>,
            beastReceiverCapability: Capability<&BasicBeasts.Collection{BasicBeasts.BeastCollectionPublic}>,
            amount: UFix64,
            beastID: UInt64
        ) {
            pre {
                beastReceiverCapability.check(): "beast receiver capability not valid"
                vaultRefCapability.borrow()!.balance >= amount: "offer vault doesn't have enough tokens to buy the beast!"
            }
            self.details = OfferDetails(offerID: self.uuid, offerAmount: amount, beastID: beastID)
            self.vaultRefCapability = vaultRefCapability
            self.beastReceiverCapability = beastReceiverCapability

            emit OfferAvailable(offerAddress: beastReceiverCapability.address, offerID: self.details.offerID, offerAmount: self.details.offerAmount, beastID: beastID)

        }
    
        pub fun accept(
            beast: @BasicBeasts.NFT, 
            receiverCapability: Capability<&FUSD.Vault{FungibleToken.Receiver}>
            ) {
            pre {
                !self.details.purchased: "Offer has already been purchased"
                beast.id == self.details.beastID: "Beast does not have the specified Beast ID"
            }

            self.details.setToPurchased()
            let beastID = beast.id

            // Check highest sale
            BeastMarket.checkHighestSale(price: self.details.offerAmount)

            // Get payment
            let payment <- self.vaultRefCapability.borrow()!.withdraw(amount: self.details.offerAmount)

            // Payout royalties
            let royalties = (beast.resolveView(Type<MetadataViews.Royalties>()) as! MetadataViews.Royalties?)!

            for royalty in royalties.getRoyalties() {

                let address = royalty.receiver.address

                if let receiverRef = getAccount(address).getCapability(/public/fusdReceiver)
                    .borrow<&FUSD.Vault{FungibleToken.Receiver}>() {
                        let beneficiaryCut <- payment.withdraw(amount: self.details.offerAmount * royalty.cut)
                        receiverRef.deposit(from: <-beneficiaryCut)

                        // Save royalties earned data to Beast Market contract
                        BeastMarket.saveRoyalty(address: address, id: beastID, royaltyAmount: self.details.offerAmount * royalty.cut)
                    } else {
                        // When beneficiary does not have a public FUSD vault receiver
                        emit RoyaltySkipped(address: address, royaltyAmount: self.details.offerAmount * royalty.cut)
                    }

            }

            // Increase Hunter Score of Buyer
            //
            let beastCollection <- BasicBeasts.createEmptyCollection() as! @BasicBeasts.Collection

            beastCollection.deposit(token: <-beast)

            let newBeastCollection <- HunterScore.increaseHunterScore(wallet: self.owner!.address, beasts: <-beastCollection)

            let offeredBeast <- newBeastCollection.withdraw(withdrawID: beastID) as! @BasicBeasts.NFT

            destroy newBeastCollection

            // Transfer beast to offeror
            self.beastReceiverCapability.borrow()!.deposit(token: <-offeredBeast)

            // Deposit the remaining tokens into the offeree's vault
            receiverCapability.borrow()!.deposit(from: <-payment)

            emit OfferCompleted(
                purchased: self.details.purchased,
                acceptingAddress: receiverCapability.address,
                offerAddress: self.beastReceiverCapability.address,
                offerID: self.details.offerID,
                offerAmount: self.details.offerAmount,
                beastID: beastID
            )
        }

        pub fun getDetails(): OfferDetails {
            return self.details
        }

        destroy() {
            if !self.details.purchased {
                emit OfferCompleted(
                    purchased: self.details.purchased,
                    acceptingAddress: nil,
                    offerAddress: self.beastReceiverCapability.address,
                    offerID: self.details.offerID,
                    offerAmount: self.details.offerAmount,
                    beastID: nil,
                )
            }
        }
    }

    pub resource interface OfferCollectionPublic {
        pub fun getIDs(): [UInt64]
        pub fun borrowOffer(id: UInt64): &BeastOffers.Offer{OfferPublic}? {
            post {
                (result == nil) || (result?.uuid == id): 
                    "Cannot borrow Offer reference: The ID of the returned reference is incorrect"
            }
        }
        pub fun cleanup(offerID: UInt64)
    }

    pub resource OfferCollection: OfferCollectionPublic {
        access(self) var offers: @{UInt64: Offer}

        init() {
            self.offers <- {}
        }

        pub fun makeOffer(
            vaultRefCapability: Capability<&FUSD.Vault{FungibleToken.Provider, FungibleToken.Balance}>, 
            beastReceiverCapability: Capability<&BasicBeasts.Collection{BasicBeasts.BeastCollectionPublic}>,
            amount: UFix64,
            beastID: UInt64
            ) {

            let newOffer <- create Offer(
                vaultRefCapability: vaultRefCapability,
                beastReceiverCapability: beastReceiverCapability,
                amount: amount,
                beastID: beastID
            )

            // Add offeror to list
            if(!BeastOffers.offerors.contains(self.owner!.address)) {
                BeastOffers.offerors.append(self.owner!.address)
            }

            let offerID = newOffer.uuid
            let oldOffer <- self.offers[offerID] <- newOffer
            destroy oldOffer
        }

        pub fun removeOffer(id: UInt64) {
            let offer <- self.offers.remove(key: id)
                ?? panic("Cannot remove offer: The offer doesn't exist in this offer collection")
            destroy offer
        }

        pub fun getIDs(): [UInt64] {
            return self.offers.keys
        }

        pub fun borrowOffer(id: UInt64): &BeastOffers.Offer{OfferPublic}? {
            let ref = &self.offers[id] as! &BeastOffers.Offer{OfferPublic}?
            return ref
        }

        pub fun borrowEntireOffer(id: UInt64): &BeastOffers.Offer? {
            let ref = &self.offers[id] as! &BeastOffers.Offer?
            return ref
        }

        pub fun cleanup(offerID: UInt64) {
            pre {
                self.offers[offerID] != nil: "Could not find Offer with given id"
            }
            let offer <- self.offers.remove(key: offerID)!
            assert(offer.getDetails().purchased == true, message: "Offer is not purchased, only admin can remove")
            destroy offer
        }

        destroy() {
            destroy self.offers
            emit OfferCollectionDestroyed(OfferCollectionID: self.uuid)
        }
    }

    pub fun createOfferCollection(): @BeastOffers.OfferCollection {
        return <-create self.OfferCollection()
    }

    pub fun getOfferors(): [Address] {
        return BeastOffers.offerors
    }

    init() {
        // Set named paths
        self.CollectionStoragePath = /storage/BasicBeastsOfferCollection_2
        self.CollectionPublicPath = /public/BasicBeastsOfferCollection_2

        // Initialize the fields
        self.offerors = []

        emit BeastOffersInitialized()
    }

}
 