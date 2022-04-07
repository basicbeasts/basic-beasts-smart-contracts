export const IS_SUSHI_VAULT_INITIALIZED = `
import Sushi from 0xSushi
import FungibleToken from 0xFungibleToken

pub fun hasSushiVault(_ address: Address): Bool {
    return getAccount(address)
      .getCapability<&Sushi.Vault{FungibleToken.Balance}>(Sushi.BalancePublicPath)
      .check()
  }

pub fun main(address: Address): Bool {
  return hasSushiVault(address)
}
`
