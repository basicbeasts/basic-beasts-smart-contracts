export const SETUP_BEAST_COLLECTION = `
import NonFungibleToken from 0xNonFungibleToken
import BasicBeasts from 0xBasicBeasts
import MetadataViews from 0xMetadataViews

pub fun hasBasicBeastsCollection(_ address: Address): Bool {
  return getAccount(address)
    .getCapability<&BasicBeasts.Collection{NonFungibleToken.CollectionPublic, BasicBeasts.BeastCollectionPublic}>(BasicBeasts.CollectionPublicPath)
    .check()
}

transaction {
  prepare(acct: AuthAccount) {
    if !hasBasicBeastsCollection(acct.address) {
      if acct.borrow<&BasicBeasts.Collection>(from: BasicBeasts.CollectionStoragePath) == nil {
        acct.save(<-BasicBeasts.createEmptyCollection(), to: BasicBeasts.CollectionStoragePath)
      }
      acct.unlink(BasicBeasts.CollectionPublicPath)
      acct.link<&BasicBeasts.Collection{NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic, BasicBeasts.BeastCollectionPublic, MetadataViews.ResolverCollection}>(BasicBeasts.CollectionPublicPath, target: BasicBeasts.CollectionStoragePath)
    }

  }
}
`
