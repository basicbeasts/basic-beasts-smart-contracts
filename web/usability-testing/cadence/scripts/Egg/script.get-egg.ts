export const GET_EGG = `
import Egg from 0xEgg

pub fun main(address: Address, eggID: UInt64): &Egg.NFT{Egg.Public}? {
    let account = getAccount(address)

    let collectionRef = account.getCapability(Egg.CollectionPublicPath)
    .borrow<&{Egg.EggCollectionPublic}>()

    var token: &Egg.NFT{Egg.Public}? = nil
    
    if (collectionRef != nil) {
        token = collectionRef!.borrowEgg(id: eggID)
            ?? panic("Couldn't borrow a reference to the specified egg")
        
    }

    return token
  
}
`
