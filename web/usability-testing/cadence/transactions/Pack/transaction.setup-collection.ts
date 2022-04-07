export const SETUP_PACK_COLLECTION = `
import Pack from 0xPack
import NonFungibleToken from 0xNonFungibleToken
import MetadataViews from 0xMetadataViews

pub fun hasPackCollection(_ address: Address): Bool {
  return getAccount(address)
    .getCapability<&Pack.Collection{NonFungibleToken.CollectionPublic, Pack.PackCollectionPublic}>(Pack.CollectionPublicPath)
    .check()
}

transaction {
  prepare(acct: AuthAccount) {
    if !hasPackCollection(acct.address) {
      if acct.borrow<&Pack.Collection>(from: Pack.CollectionStoragePath) == nil {
        acct.save(<-Pack.createEmptyCollection(), to: Pack.CollectionStoragePath)
      }
      acct.unlink(Pack.CollectionPublicPath)
      acct.link<&Pack.Collection{NonFungibleToken.Receiver, NonFungibleToken.CollectionPublic, Pack.PackCollectionPublic, MetadataViews.ResolverCollection}>(Pack.CollectionPublicPath, target: Pack.CollectionStoragePath)
    }

  }
}
`
