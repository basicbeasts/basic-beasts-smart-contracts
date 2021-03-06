export const MINT_BEAST = `
import BasicBeasts from 0xBasicBeasts

transaction(beastTemplateID: UInt32) {

    let adminRef: &BasicBeasts.Admin
    let receiverRef: &BasicBeasts.Collection{BasicBeasts.BeastCollectionPublic}

    prepare(acct: AuthAccount) {
        self.adminRef = acct.borrow<&BasicBeasts.Admin>(from: BasicBeasts.AdminStoragePath)
            ?? panic("No Admin resource in storage")

        self.receiverRef = acct.borrow<&BasicBeasts.Collection{BasicBeasts.BeastCollectionPublic}>(from: BasicBeasts.CollectionStoragePath)
        ?? panic("Can't borrow a reference to the Admin's Beast collection")

    }

    execute {

        let newMintedBeast <- self.adminRef.mintBeast(beastTemplateID: beastTemplateID)

        self.receiverRef.deposit(token: <-newMintedBeast)
    }

}
`
