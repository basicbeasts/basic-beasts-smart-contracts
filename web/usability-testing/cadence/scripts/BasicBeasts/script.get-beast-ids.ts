export const GET_BEAST_IDS = `
import BasicBeasts from 0xBasicBeasts

pub fun main(acct: Address): [UInt64] {
    
    let collectionRef = getAccount(acct).getCapability(BasicBeasts.CollectionPublicPath)
    .borrow<&{BasicBeasts.BeastCollectionPublic}>()
    ?? panic("Could not get public beast collection reference")

    return collectionRef.getIDs()
}
`
