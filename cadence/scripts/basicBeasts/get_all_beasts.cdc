import HunterScore from "./../../../cadence/contracts/HunterScore.cdc"
import BasicBeasts from "./../../../cadence/contracts/BasicBeasts.cdc"
import BeastMarket from "./../../../cadence/contracts/BeastMarket.cdc"

pub fun main(): [{String:AnyStruct}] {

    //Get all addresses
    let addresses = HunterScore.getHunterScores().keys

    var beasts: [{String: AnyStruct}] = []

    for address in addresses {

        let collectionRef = getAccount(address).getCapability(BasicBeasts.CollectionPublicPath)
        .borrow<&{BasicBeasts.BeastCollectionPublic}>()
        
        if (collectionRef != nil) {
            let IDs = collectionRef!.getIDs()
            var i = 0
            while i < IDs.length {
            let token = collectionRef!.borrowBeast(id: IDs[i])
            ?? panic("Couldn't borrow a reference to the specified beast")

            let beastTemplate = token.getBeastTemplate()

            var price: UFix64? = nil

            if (i%2==0) {
                price = 69.0 + UFix64(i)
            }
            
            let beast = {
                "name" : beastTemplate.name,
                "nickname" : token.getNickname(),
                "serialNumber" : token.serialNumber,
                "dexNumber" : beastTemplate.dexNumber,
                "skin" : beastTemplate.skin,
                "starLevel" : beastTemplate.starLevel,
                "elements" : beastTemplate.elements,
                "basicSkills" : beastTemplate.basicSkills,
                "ultimateSkill" : beastTemplate.ultimateSkill,
                "currentOwner" : address,
                "firstOwner" : token.getFirstOwner(),
                "sex" : token.sex,
                "breedingCount" : 0,
                "numberOfMintedBeastTemplates" : 100,
                "beastTemplateID" : beastTemplate.beastTemplateID,
                "price" : price,
                "id": token.id
            }

            beasts.append(beast)
        
            i = i + 1
            }
        }
    }

    return beasts
}