import FungibleToken from "../flow/FungibleToken.cdc"
import MetadataViews from "../flow/MetadataViews.cdc"
import FUSD from "../flow/FUSD.cdc"
import BasicBeasts from "./BasicBeasts.cdc"
import HunterScore from "./HunterScore.cdc"

pub contract BeastOffers {

    pub event OfferAvailable(
        offerAddress: Address,
        offerID: UInt64,
        offerAmount: UFix64,
        royalties: {Address:UFix64}
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

        init(offerID: UInt64, offerAmount: UFix64, purchased: Bool) {
            self.offerID = offerID
            self.offerAmount = offerAmount
            self.purchased = purchased
        }
    }

    pub resource interface OfferPublic {
        pub fun accept(beast: @BasicBeasts.NFT, receiverCapability: Capability<&FUSD.Vault{FungibleToken.Receiver}>)
        pub fun getDetails(): OfferDetails
    }

    pub resource Offer: OfferPublic {
        access(self) let details: OfferDetails
    
        pub fun accept(beast: @BasicBeasts.NFT, receiverCapability: Capability<&FUSD.Vault{FungibleToken.Receiver}>) {
            panic("TODO")
        }

        pub fun getDetails(): BeastOffers.OfferDetails {
            panic("TODO")
        }
}

}