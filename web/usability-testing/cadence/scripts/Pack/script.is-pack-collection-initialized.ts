export const IS_PACK_COLLECTION_INITIALIZED = `
import NonFungibleToken from 0xNonFungibleToken
import Pack from 0xPack

pub fun hasPackCollection(_ address: Address): Bool {
  return getAccount(address)
    .getCapability<&Pack.Collection{NonFungibleToken.CollectionPublic, Pack.PackCollectionPublic}>(Pack.CollectionPublicPath)
    .check()
}

pub fun main(address: Address): Bool {
  return hasPackCollection(address)
}
`
