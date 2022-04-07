export const GET_EMPTY_POTION_BOTTLE_BALANCE = `
import EmptyPotionBottle from 0xEmptyPotionBottle
import FungibleToken from 0xFungibleToken

pub fun main(address: Address): UFix64? {
  let account = getAccount(address)

  if let vaultRef = account.getCapability(EmptyPotionBottle.BalancePublicPath).borrow<&EmptyPotionBottle.Vault{FungibleToken.Balance}>() {
    return vaultRef.balance
  } 
  return nil
  
}
`
