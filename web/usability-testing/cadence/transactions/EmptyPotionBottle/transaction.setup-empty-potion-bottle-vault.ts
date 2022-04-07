export const SETUP_EMPTY_POTION_BOTTLE_VAULT = `
import EmptyPotionBottle from 0xEmptyPotionBottle
import FungibleToken from 0xFungibleToken

pub fun hasEmptyPotionBottleVault(_ address: Address): Bool {
  return getAccount(address)
    .getCapability<&EmptyPotionBottle.Vault{FungibleToken.Balance}>(EmptyPotionBottle.BalancePublicPath)
    .check()
}

transaction {
  prepare(acct: AuthAccount) {
    if !hasEmptyPotionBottleVault(acct.address) {
      if acct.borrow<&EmptyPotionBottle.Vault>(from: EmptyPotionBottle.VaultStoragePath) == nil {
        acct.save(<-EmptyPotionBottle.createEmptyVault(), to: EmptyPotionBottle.VaultStoragePath)
      }
      acct.unlink(EmptyPotionBottle.ReceiverPublicPath)
      acct.unlink(EmptyPotionBottle.BalancePublicPath)

        acct.link<&EmptyPotionBottle.Vault{FungibleToken.Receiver}>(
          EmptyPotionBottle.ReceiverPublicPath,
            target: EmptyPotionBottle.VaultStoragePath
        )

        acct.link<&EmptyPotionBottle.Vault{FungibleToken.Balance}>(
          EmptyPotionBottle.BalancePublicPath,
            target: EmptyPotionBottle.VaultStoragePath
        )
    }
  }
}
`
