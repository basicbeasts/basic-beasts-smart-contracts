export const GET_SUSHI_BALANCE = `
import Sushi from 0xSushi
import FungibleToken from 0xFungibleToken

pub fun main(address: Address): UFix64? {
  let account = getAccount(address)

  if let vaultRef = account.getCapability(Sushi.BalancePublicPath).borrow<&Sushi.Vault{FungibleToken.Balance}>() {
    return vaultRef.balance
  } 
  return nil
  
}
`
