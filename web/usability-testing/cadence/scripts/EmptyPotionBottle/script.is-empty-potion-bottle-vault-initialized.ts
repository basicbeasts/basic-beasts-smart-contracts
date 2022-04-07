export const IS_EMPTY_POTION_BOTTLE_VAULT_INITIALIZED = `
import EmptyPotionBottle from 0xEmptyPotionBottle
import FungibleToken from 0xFungibleToken

pub fun hasEmptyPotionBottleVault(_ address: Address): Bool {
    return getAccount(address)
      .getCapability<&EmptyPotionBottle.Vault{FungibleToken.Balance}>(EmptyPotionBottle.BalancePublicPath)
      .check()
  }

pub fun main(address: Address): Bool {
  return hasEmptyPotionBottleVault(address)
}
`
