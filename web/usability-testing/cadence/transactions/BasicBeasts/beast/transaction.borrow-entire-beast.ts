export const BORROW_ENTIRE_BEAST = `
import BasicBeasts from 0xBasicBeasts

transaction(id: UInt64): &BasicBeasts.NFT? {

    prepare(acct: AuthAccount) {

        let collectionRef = acct.borrow<&BasicBeasts.Collection>(from: BasicBeasts.CollectionStoragePath)
            ?? panic("Could not borrow a reference to the stored Beast collection")

    return collectionRef.borrowEntireBeast(id: id)

    }
    execute {
        
    }
}
`
