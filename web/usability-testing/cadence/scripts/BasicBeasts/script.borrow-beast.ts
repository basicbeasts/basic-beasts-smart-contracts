export const BORROW_BEAST = `
import BasicBeasts from 0xBasicBeasts

pub fun main(acct: Address, id: UInt64): &BasicBeasts.NFT? {
    
    let collectionRef = getAccount(acct).getCapability(BasicBeasts.CollectionPublicPath)
    .borrow<&{BasicBeasts.BeastCollectionPublic}>()
    ?? panic("Could not get public beast collection reference")

    return collectionRef.borrowBeast(id: id)
}
`
