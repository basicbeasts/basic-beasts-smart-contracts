export const BORROW_ENTIRE_BEAST = `
import BasicBeasts from 0xBasicBeasts

pub fun main(acct: Address, id: UInt64): &BasicBeasts.NFT? {
    
    let collectionRef = acct.borrow<&BasicBeasts.Collection>(from: BasicBeasts.CollectionStoragePath)
            ?? panic("Could not borrow a reference to the stored Beast collection")

    
}
`

// let beast <- collectionRef.borrowEntireBeast(withdrawID: id)

//     let entireBeastRef = beast.borrowEntireBeast(id: id)

//     collectionRef.deposit(token: <-beast)

//     return entireBeastRef
