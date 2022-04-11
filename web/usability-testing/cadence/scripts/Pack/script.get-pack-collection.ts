export const GET_PACK_COLLECTION = `
import Pack from 0xPack

pub fun main(acct: Address): [&Pack.NFT{Pack.Public}] {
    var packCollection: [&Pack.NFT{Pack.Public}] = []

    let collectionRef = getAccount(acct).getCapability(Pack.CollectionPublicPath)
        .borrow<&{Pack.PackCollectionPublic}>()
        ?? panic("Could not get public Pack collection reference")

    let PackIDs = collectionRef.getIDs()

    for id in PackIDs {
        let pack = collectionRef.borrowPack(id: id)!
        
        packCollection.append(pack)
    }

  return packCollection
}
`
