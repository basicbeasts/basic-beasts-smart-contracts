import BasicBeasts from "./../../../cadence/contracts/BasicBeasts.cdc"
import BeastOffers from "./../../../cadence/contracts/BeastOffers.cdc"

pub fun main(): [{String:AnyStruct}] {

    //Get all addresses
    let addresses = BeastOffers.getOfferors()

    var offers: [{String: AnyStruct}] = []

    for address in addresses {

        let collectionRef = getAccount(address).getCapability(BeastOffers.CollectionPublicPath)
        .borrow<&BeastOffers.OfferCollection{BeastOffers.OfferCollectionPublic}>()
        
        if (collectionRef != nil) {
            let IDs = collectionRef!.getIDs()

            var i = 0
            while i < IDs.length {
            let offerRef = collectionRef!.borrowOffer(id: IDs[i])

            if(offerRef != nil) {
                let offerDetails = offerRef!.getDetails()

                if(!offerDetails.purchased) {
                
                    let offer = {
                        "offerID" : offerDetails.offerID,
                        "offerAmount" : offerDetails.offerAmount,
                        "beastID": offerDetails.beastID,
                        "offeror": address
                    }

                    offers.append(offer)
                }
                
            }
            i = i + 1
            }
        }
    }

    return offers
}