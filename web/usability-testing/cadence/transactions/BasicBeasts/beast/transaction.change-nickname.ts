// This one works.
// export const CHANGE_NICKNAME = `
// import BasicBeasts from 0xBasicBeasts
// import NonFungibleToken from 0xNonFungibleToken

// transaction(nickname: String, beastID: UInt64) {

//     prepare(acct: AuthAccount) {

//         let collectionRef = acct.borrow<&BasicBeasts.Collection>(from: BasicBeasts.CollectionStoragePath)
//             ?? panic("Could not borrow a reference to the stored Beast collection")

//         let beast <- collectionRef.withdraw(withdrawID: beastID) as! @BasicBeasts.NFT

//         beast.setNickname(nickname: nickname)

//         collectionRef.deposit(token: <-beast)

//     }
//     execute {
//     }
// }
// `

//This one also works
export const CHANGE_NICKNAME = `
import BasicBeasts from 0xBasicBeasts
import NonFungibleToken from 0xNonFungibleToken

transaction(nickname: String, beastID: UInt64) {

    prepare(acct: AuthAccount) {

        let collectionRef = acct.borrow<&BasicBeasts.Collection>(from: BasicBeasts.CollectionStoragePath)
            ?? panic("Could not borrow a reference to the stored Beast collection")

        let beast = collectionRef.borrowBeast(id: beastID)!

        beast.setNickname(nickname: nickname)

    }
    execute {
    }
}
`
