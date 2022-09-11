export const CLAIM_SOME_MAILS = `
import Inbox from 0xInbox
import Pack from 0xPack
import NonFungibleToken from 0xNonFungibleToken
import MetadataViews from 0xMetadataViews

pub fun hasPackCollection(_ address: Address): Bool {
    return getAccount(address)
      .getCapability<&Pack.Collection{NonFungibleToken.CollectionPublic, Pack.PackCollectionPublic}>(Pack.CollectionPublicPath)
      .check()
  }

transaction(adminAcct: Address, quantity: Int) {
    let centralizedInboxRef: &Inbox.CentralizedInbox{Inbox.Public}
    let packCollectionRef: &Pack.Collection{NonFungibleToken.Receiver}
    let length: Int
    let IDs: [UInt64]

    prepare(acct: AuthAccount) {

        self.centralizedInboxRef = getAccount(adminAcct).getCapability(Inbox.CentralizedInboxPublicPath)
        .borrow<&Inbox.CentralizedInbox{Inbox.Public}>()
        ?? panic("Could not get Centralized Inbox reference")

        self.IDs = self.centralizedInboxRef.getIDs(wallet: acct.address)!

        self.length = self.IDs.length

        if !hasPackCollection(acct.address) {
            if acct.borrow<&Pack.Collection>(from: Pack.CollectionStoragePath) == nil {
              acct.save(<-Pack.createEmptyCollection(), to: Pack.CollectionStoragePath)
            }
            acct.unlink(Pack.CollectionPublicPath)
            acct.link<&Pack.Collection{NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic, Pack.PackCollectionPublic, MetadataViews.ResolverCollection}>(Pack.CollectionPublicPath, target: Pack.CollectionStoragePath)
        }

        self.packCollectionRef = acct.borrow<&Pack.Collection{NonFungibleToken.Receiver}>(from: Pack.CollectionStoragePath)
        ?? panic("No Pack Collection resource in storage")

    }

    execute {
        
        var i = 0
        if (self.length < quantity) {
            while i < self.length {
                self.centralizedInboxRef.claimMail(recipient: self.packCollectionRef, id: self.IDs[i])
                i = i + 1
            } 
        } else {
            while i < quantity {
                self.centralizedInboxRef.claimMail(recipient: self.packCollectionRef, id: self.IDs[i])
                i = i + 1
            }
        }
        
        
    }

}
`
