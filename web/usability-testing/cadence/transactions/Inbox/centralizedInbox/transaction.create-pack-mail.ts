export const CREATE_PACK_MAIL = `
import Inbox from 0xInbox
import Pack from 0xPack

transaction(mails: {Address:[UInt64]}) {

    let centralizedInboxRef: &Inbox.CentralizedInbox
    let packCollectionRef: &Pack.Collection

    prepare(acct: AuthAccount) {
        self.centralizedInboxRef = acct.borrow<&Inbox.CentralizedInbox>(from: Inbox.CentralizedInboxStoragePath)
            ?? panic("No Centralized Inbox resource in storage")

        self.packCollectionRef = acct.borrow<&Pack.Collection>(from: Pack.CollectionStoragePath)
        ?? panic("No Pack Collection resource in storage")

    }

    execute {
        let addresses = mails.keys

        for address in addresses {
            let packCollection <- Pack.createEmptyCollection() as! @Pack.Collection

            for id in mails[address]! {
                packCollection.deposit(token: <- self.packCollectionRef.withdraw(withdrawID: id))
            }

            self.centralizedInboxRef.createPackMail(wallet: address, packs: <- packCollection)
        }
    }

}
`
