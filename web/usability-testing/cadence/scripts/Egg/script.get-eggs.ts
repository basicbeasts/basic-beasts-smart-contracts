export const GET_EGGS = `
import Egg from 0xEgg
import FungibleToken from 0xFungibleToken

pub fun main(address: Address): [&Egg.NFT{Egg.Public}] {
    let account = getAccount(address)

    let collectionRef = account.getCapability(Egg.CollectionPublicPath)
    .borrow<&{Egg.EggCollectionPublic}>()

    var collection: [&Egg.NFT{Egg.Public}] = []
    if (collectionRef != nil) {
        let IDs = collectionRef!.getIDs()
        var i = 0
        while i < IDs.length {
            let token = collectionRef!.borrowEgg(id: IDs[i])
            ?? panic("Couldn't borrow a reference to the specified egg")

            collection.append(token)

            i = i + 1
        }
    }


    return collection
  
}
`
