export const IS_POOP_VAULT_INITIALIZED = `
import Poop from 0xPoop
import FungibleToken from 0xFungibleToken

pub fun hasPoopVault(_ address: Address): Bool {
    return getAccount(address)
      .getCapability<&Poop.Vault{FungibleToken.Balance}>(Poop.BalancePublicPath)
      .check()
  }

pub fun main(address: Address): Bool {
  return hasPoopVault(address)
}
`
