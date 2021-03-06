export const CHANGE_NICKNAME = `
import BasicBeasts from 0xBasicBeasts

transaction(nickname: String, id: UInt64) {

    let beastRef: &BasicBeasts.NFT

    prepare(acct: AuthAccount) {

        let collectionRef = acct.borrow<&BasicBeasts.Collection>(from: BasicBeasts.CollectionStoragePath)
            ?? panic("Could not borrow a reference to the stored Beast collection")

        self.beastRef = collectionRef.borrowEntireBeast(id: id)!

    }
    execute {
        self.beastRef.setNickname(nickname: nickname)
    }
}
`
