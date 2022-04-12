export const BATCH_MINT_PACK = `
import Pack from 0xPack

transaction(stockNumbers: [UInt64], packTemplateID: UInt32) {

    let adminRef: &Pack.Admin
    let receiverRef: &Pack.Collection{Pack.PackCollectionPublic}

    prepare(acct: AuthAccount) {
        self.adminRef = acct.borrow<&Pack.Admin>(from: Pack.AdminStoragePath)
            ?? panic("No Admin resource in storage")

        self.receiverRef = acct.borrow<&Pack.Collection{Pack.PackCollectionPublic}>(from: Pack.CollectionStoragePath)
        ?? panic("Can't borrow a reference to the Admin's Pack collection")

    }

    execute {

        var i = 0
        while i < stockNumbers.length {
            let newMintedPack <- self.adminRef.mintPack(stockNumber: stockNumbers[i], packTemplateID: packTemplateID)
            self.receiverRef.deposit(token: <-newMintedPack)
            i = i + 1
        }
        
    }

}
`
