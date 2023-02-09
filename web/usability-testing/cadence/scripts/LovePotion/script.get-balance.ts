export const GET_LOVE_POTION_BALANCE = `
import LovePotion from 0xLovePotion
import FungibleToken from 0xFungibleToken

pub fun main(address: Address): Int {
    let account = getAccount(address)

    let collectionRef = account.getCapability(LovePotion.CollectionPublicPath)
    .borrow<&{LovePotion.LovePotionCollectionPublic}>()

    var count: Int = 0
    if (collectionRef != nil) {
        let IDs = collectionRef!.getIDs()
        count = IDs.length
    }


    return count
  
}
`
