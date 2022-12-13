import FungibleToken from "../flow/FungibleToken.cdc"
import MetadataViews from "../flow/MetadataViews.cdc"
import FUSD from "../flow/FUSD.cdc"
import BasicBeasts from "./BasicBeasts.cdc"
import HunterScore from "./HunterScore.cdc"

pub contract BeastOffers {

    pub event OfferAvailable(
        offerAddress: Address,
        offerID: UInt64,
        offerAmount: UFix64
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
        royalties: {Address:UFix64},
        nftId: UInt64?,
    )

    pub struct OfferDetails {
        pub let offerID: UInt64
        pub let offerAmount: UFix64
        pub var purchased: Bool

        // setToPurchased
        // Irreversibly set this offer as purchased.
        //
        access(contract) fun setToPurchased() {
            self.purchased = true
        }

        init(offerID: UInt64, offerAmount: UFix64) {
            self.offerID = offerID
            self.offerAmount = offerAmount
            self.purchased = false
        }
    }

    pub resource interface OfferPublic {
        pub fun accept(beast: @BasicBeasts.NFT, receiverCapability: Capability<&FUSD.Vault{FungibleToken.Receiver}>)
        pub fun getDetails(): OfferDetails
    }

    pub resource Offer: OfferPublic {
        access(self) let details: OfferDetails
        access(contract) let vaultRefCapability: Capability<&FUSD.Vault{FungibleToken.Provider, FungibleToken.Balance}>
        access(contract) let beastReceiverCapability: Capability<&BasicBeasts.Collection{BasicBeasts.BeastCollectionPublic}>

        init(
            vaultRefCapability: Capability<&FUSD.Vault{FungibleToken.Provider, FungibleToken.Balance}>,
            beastReceiverCapability: Capability<&BasicBeasts.Collection{BasicBeasts.BeastCollectionPublic}>,
            amount: UFix64
        ) {
            pre {
                beastReceiverCapability.check(): "beast receiver capability not valid"
                amount > 0.0: "offerAmount must be > 0"
                vaultRefCapability.borrow()!.balance >= amount: "offer vault doesn't have enough tokens to buy the beast!"
            }
            self.details = OfferDetails(offerID: self.uuid, offerAmount: amount)
            self.vaultRefCapability = vaultRefCapability
            self.beastReceiverCapability = beastReceiverCapability

            emit OfferAvailable(offerAddress: beastReceiverCapability.address, offerID: self.details.offerID, offerAmount: self.details.offerAmount)

        }
    
        pub fun accept(beast: @BasicBeasts.NFT, receiverCapability: Capability<&FUSD.Vault{FungibleToken.Receiver}>) {
            pre {
                !self.details.purchased: "Offer has already been purchased"
            }
            self.details.setToPurchased()
            let beastID = beast.id

            // Payout royalties
            let royalties = (beast.resolveView(Type<MetadataViews.Royalties>()) as! MetadataViews.Royalties?)!

            for royalty in royalties.getRoyalties() {
                let beneficiaryCut <- self.vaultRefCapability.borrow()!.withdraw(amount: self.details.offerAmount * royalty.cut)

                let address = royalty.receiver.address

                let receiverRef = getAccount(address).getCapability(/public/fusdReceiver)
                    .borrow<&FUSD.Vault{FungibleToken.Receiver}>()
                    ?? panic("Could not borrow receiver reference to the recipient's Vault")

                receiverRef.deposit(from: <-beneficiaryCut)

                // Save royalties earned data to contract
                if(BeastMarket.royaltiesEarned[address] == nil) {
                    BeastMarket.royaltiesEarned[address] = {}
                }
                if(BeastMarket.royaltiesEarned[address]![boughtBeast.id] == nil) {
                    let royaltiesFromBeast = BeastMarket.royaltiesEarned[address]!
                    royaltiesFromBeast[boughtBeast.id] = price * royalty.cut
                } else {
                    let royaltiesFromBeast = BeastMarket.royaltiesEarned[address]!
                    royaltiesFromBeast[boughtBeast.id] = royaltiesFromBeast[boughtBeast.id]! + price * royalty.cut
                }
            }
            self.beastReceiverCapability.borrow()!.deposit(token: <-beast)
        }

        pub fun getDetails(): BeastOffers.OfferDetails {
            panic("TODO")
        }
}

}