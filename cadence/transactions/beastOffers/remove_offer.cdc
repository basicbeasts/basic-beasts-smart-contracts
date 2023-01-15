import BeastOffers from "./../../../cadence/contracts/BeastOffers.cdc"

transaction(offerID: UInt64) {

    prepare(acct: AuthAccount) {
        //Get the offer collection reference
        let collectionRef = acct.borrow<&BeastOffers.OfferCollection>(from: BeastOffers.CollectionStoragePath)
            ?? panic("Missing or mis-typed BeastOffers.OfferCollection")

        //Remove offer
        collectionRef.removeOffer(id: offerID)
        
    }

}