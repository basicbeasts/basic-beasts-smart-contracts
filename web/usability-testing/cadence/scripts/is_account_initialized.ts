export const IS_ACCOUNT_INITIALIZED_SCRIPT = `
import NonFungibleToken from 0xf8d6e0586b0a20c7
import BasicBeasts from 0xf8d6e0586b0a20c7

pub fun hasBasicBeastsCollection(_ address: Address): Bool {
  return getAccount(address)
    .getCapability<&BasicBeasts.Collection{NonFungibleToken.CollectionPublic, BasicBeasts.BeastCollectionPublic}>(BasicBeasts.CollectionPublicPath)
    .check()
}

pub fun main(address: Address): {String: Bool} {
  let results: {String: Bool} = {}
  results["BasicBeasts"] = hasBasicBeastsCollection(address)
  return results
}
`
