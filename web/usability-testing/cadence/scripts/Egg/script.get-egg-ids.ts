export const GET_EGG_IDS = `
import Egg from 0xEgg
import FungibleToken from 0xFungibleToken

pub fun main(address: Address): [UInt64] {
    let account = getAccount(address)

    let collectionRef = account.getCapability(Egg.CollectionPublicPath)
    .borrow<&{Egg.EggCollectionPublic}>()

    var IDs: [UInt64] = []

    if (collectionRef != nil) {
        IDs = collectionRef!.getIDs()
    }


    return IDs
  
}
`
