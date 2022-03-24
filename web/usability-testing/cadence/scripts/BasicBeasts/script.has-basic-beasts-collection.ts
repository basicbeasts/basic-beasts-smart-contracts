export const HAS_BASIC_BEASTS_COLLECTION = `
import NonFungibleToken from 0xNonFungibleToken
import BasicBeasts from 0xBasicBeasts

pub fun hasBasicBeastsCollection(_ address: Address): Bool {
  return getAccount(address)
    .getCapability<&BasicBeasts.Collection{NonFungibleToken.CollectionPublic, BasicBeasts.BeastCollectionPublic}>(BasicBeasts.CollectionPublicPath)
    .check()
}

pub fun main(address: Address): Bool {
  return hasBasicBeastsCollection(address)
}
`
