export const CLAIM_ALL_MAIL = `
import Inbox from 0xInbox
import Pack from 0xPack
import NonFungibleToken from 0xNonFungibleToken
import MetadataViews from 0xMetadataViews

pub fun hasPackCollection(_ address: Address): Bool {
    return getAccount(address)
      .getCapability<&Pack.Collection{NonFungibleToken.CollectionPublic, Pack.PackCollectionPublic}>(Pack.CollectionPublicPath)
      .check()
  }

transaction(adminAcct: Address) {

    let centralizedInboxRef: &Inbox.CentralizedInbox{Inbox.Public}
    let packCollectionRef: &Pack.Collection{NonFungibleToken.Receiver}

    prepare(acct: AuthAccount) {
        self.centralizedInboxRef = getAccount(adminAcct).getCapability(Inbox.CentralizedInboxPublicPath)
        .borrow<&Inbox.CentralizedInbox{Inbox.Public}>()
        ?? panic("Could not get Centralized Inbox reference")

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
        self.centralizedInboxRef.claimMails(recipient: self.packCollectionRef)
        
    }

}
`
