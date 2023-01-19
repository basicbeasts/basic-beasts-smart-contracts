import FungibleToken from "./../../../cadence/flow/FungibleToken.cdc"
import FUSD from "./../../../cadence/flow/FUSD.cdc"
import BasicBeasts from "./../../../cadence/contracts/BasicBeasts.cdc"
import BeastOffers from "./../../../cadence/contracts/BeastOffers.cdc"

transaction(offerorAddress: Address, offerID: UInt64, beastID: UInt64) {

    let collectionRef: &BasicBeasts.Collection
    let offerCollectionRef: &BeastOffers.OfferCollection{BeastOffers.OfferCollectionPublic}
    let offer: &BeastOffers.Offer{BeastOffers.OfferPublic}
    let receiverCapability: Capability<&FUSD.Vault{FungibleToken.Receiver}>

    prepare(acct: AuthAccount) {
        // check for FUSD vault
        if acct.borrow<&FUSD.Vault>(from: /storage/fusdVault) == nil {
            // Create a new FUSD Vault and put it in storage
            acct.save(<-FUSD.createEmptyVault(), to: /storage/fusdVault)

            // Create a public capability to the Vault that only exposes
            // the deposit function through the Receiver interface
            acct.link<&FUSD.Vault{FungibleToken.Receiver}>(
                /public/fusdReceiver,
                target: /storage/fusdVault
            )

            // Create a public capability to the Vault that only exposes
            // the balance field through the Balance interface
            acct.link<&FUSD.Vault{FungibleToken.Balance}>(
                /public/fusdBalance,
                target: /storage/fusdVault
            )
        }

        // Get offer collection
        self.offerCollectionRef = getAccount(offerorAddress).getCapability(BeastOffers.CollectionPublicPath)
        .borrow<&BeastOffers.OfferCollection{BeastOffers.OfferCollectionPublic}>()
            ?? panic("Couldn't borrow offeror's offer collection")

        // Get offer
        self.offer = self.offerCollectionRef.borrowOffer(id: offerID) 
            ?? panic("Couldn't find offer in the offer collection")

        // Get beast collection reference
        self.collectionRef = acct.borrow<&BasicBeasts.Collection>(from: BasicBeasts.CollectionStoragePath)
            ?? panic("No beast collection reference found")
        
        // Get FUSD receiver reference
        self.receiverCapability = acct.getCapability<&FUSD.Vault{FungibleToken.Receiver}>(/public/fusdReceiver)
        assert(self.receiverCapability.check(), message: "Missing or mis-typed FUSD vault provider")
    }

    execute {
        let beast <- self.collectionRef.withdraw(withdrawID: beastID) as! @BasicBeasts.NFT
        self.offer.accept(beast: <-beast, receiverCapability: self.receiverCapability)
        self.offerCollectionRef.cleanup(offerID: offerID)
    }
}
 