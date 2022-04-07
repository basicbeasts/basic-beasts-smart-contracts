export const SETUP_SUSHI_VAULT = `
import Sushi from 0xSushi
import FungibleToken from 0xFungibleToken

pub fun hasSushiVault(_ address: Address): Bool {
  return getAccount(address)
    .getCapability<&Sushi.Vault{FungibleToken.Balance}>(Sushi.BalancePublicPath)
    .check()
}

transaction {
  prepare(acct: AuthAccount) {
    if !hasSushiVault(acct.address) {
      if acct.borrow<&Sushi.Vault>(from: Sushi.VaultStoragePath) == nil {
        acct.save(<-Sushi.createEmptyVault(), to: Sushi.VaultStoragePath)
      }
      acct.unlink(Sushi.ReceiverPublicPath)
      acct.unlink(Sushi.BalancePublicPath)

        acct.link<&Sushi.Vault{FungibleToken.Receiver}>(
            Sushi.ReceiverPublicPath,
            target: Sushi.VaultStoragePath
        )

        acct.link<&Sushi.Vault{FungibleToken.Balance}>(
            Sushi.BalancePublicPath,
            target: Sushi.VaultStoragePath
        )
    }
  }
}
`
