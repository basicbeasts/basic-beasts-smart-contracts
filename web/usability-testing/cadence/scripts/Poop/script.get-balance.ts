export const GET_POOP_BALANCE = `
import Poop from 0xPoop
import FungibleToken from 0xFungibleToken

pub fun main(address: Address): UFix64? {
  let account = getAccount(address)

  if let vaultRef = account.getCapability(Poop.BalancePublicPath).borrow<&Poop.Vault{FungibleToken.Balance}>() {
    return vaultRef.balance
  } 
  return nil
  
}
`
