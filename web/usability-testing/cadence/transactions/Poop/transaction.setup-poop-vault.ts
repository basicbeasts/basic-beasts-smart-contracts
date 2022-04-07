export const SETUP_POOP_VAULT = `
import Poop from 0xPoop
import FungibleToken from 0xFungibleToken

pub fun hasPoopVault(_ address: Address): Bool {
  return getAccount(address)
    .getCapability<&Poop.Vault{FungibleToken.Balance}>(Poop.BalancePublicPath)
    .check()
}

transaction {
  prepare(acct: AuthAccount) {
    if !hasPoopVault(acct.address) {
      if acct.borrow<&Poop.Vault>(from: Poop.VaultStoragePath) == nil {
        acct.save(<-Poop.createEmptyVault(), to: Poop.VaultStoragePath)
      }
      acct.unlink(Poop.ReceiverPublicPath)
      acct.unlink(Poop.BalancePublicPath)

        acct.link<&Poop.Vault{FungibleToken.Receiver}>(
          Poop.ReceiverPublicPath,
            target: Poop.VaultStoragePath
        )

        acct.link<&Poop.Vault{FungibleToken.Balance}>(
          Poop.BalancePublicPath,
            target: Poop.VaultStoragePath
        )
    }
  }
}
`
