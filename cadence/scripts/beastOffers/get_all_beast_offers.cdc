import HunterScore from "./../../../cadence/contracts/HunterScore.cdc"
import BasicBeasts from "./../../../cadence/contracts/BasicBeasts.cdc"
import BeastOffers from "./../../../cadence/contracts/BeastOffers.cdc"

pub fun main(): [{String:AnyStruct}] {

    //Get all addresses
    let addresses = HunterScore.getHunterScores().keys

    var beastsForSale: [{String: AnyStruct}] = []

    for address in addresses {

        let collectionRef = getAccount(address).getCapability(BeastMarket.CollectionPublicPath)
        .borrow<&BeastMarket.SaleCollection{BeastMarket.SalePublic}>()
        
        if (collectionRef != nil) {
            let IDs = collectionRef!.getIDs()

            var i = 0
            while i < IDs.length {
            let token = collectionRef!.borrowBeast(id: IDs[i])

            if(token != nil) {
                let beastTemplate = token!.getBeastTemplate()

                let price = collectionRef!.getPrice(tokenID: IDs[i])
                
                let beast = {
                    "name" : beastTemplate.name,
                    "beastTemplateID" : beastTemplate.beastTemplateID,
                    "id": IDs[i],
                    "price" : price,
                    "seller": address

                }

                beastsForSale.insert(at:i, beast)
            }

            
        
            i = i + 1
            }
        }
    }

    return beastsForSale
}