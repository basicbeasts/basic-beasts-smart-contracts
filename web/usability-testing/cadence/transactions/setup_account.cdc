import NonFungibleToken from 0xNonFungibleToken
import BasicBeasts from 0xBasicBeasts

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
      acct.link<&BasicBeasts.Collection{NonFungibleToken.CollectionPublic, BasicBeasts.BeastCollectionPublic}>(BasicBeasts.CollectionPublicPath, target: BasicBeasts.CollectionStoragePath)
    }

  }
}