export const SUSHI_MINT_TOKENS = `
import Sushi from 0xSushi
import FungibleToken from 0xFungibleToken

transaction (to: Address, amount: UFix64) {
    let sentVault: @FungibleToken.Vault
  
    prepare(signer: AuthAccount) {
      let minterRef = signer.borrow<&Sushi.Minter>(from: Sushi.MinterStoragePath) ?? panic("Cannot borrow minter reference")
      self.sentVault <- minterRef.mintTokens(amount: amount)
    }
  
    execute {
      let recipient = getAccount(to)
      let receiverRef = recipient.getCapability(Sushi.ReceiverPublicPath).borrow<&{FungibleToken.Receiver}>()
              ?? panic("Could not borrow receiver reference to the recipient's Vault")
  
      // Deposit the withdrawn tokens in the recipient's receiver
      receiverRef.deposit(from: <-self.sentVault)
    }
  }
`
