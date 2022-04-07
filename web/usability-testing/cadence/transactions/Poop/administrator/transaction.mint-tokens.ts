export const POOP_MINT_TOKENS = `
import Poop from 0xPoop
import FungibleToken from 0xFungibleToken

transaction (to: Address, amount: UFix64) {
    let sentVault: @FungibleToken.Vault
  
    prepare(signer: AuthAccount) {
      let minterRef = signer.borrow<&Poop.Minter>(from: Poop.MinterStoragePath) ?? panic("Cannot borrow minter reference")
      self.sentVault <- minterRef.mintTokens(amount: amount)
    }
  
    execute {
      let recipient = getAccount(to)
      let receiverRef = recipient.getCapability(Poop.ReceiverPublicPath).borrow<&{FungibleToken.Receiver}>()
              ?? panic("Could not borrow receiver reference to the recipient's Vault")
  
      // Deposit the withdrawn tokens in the recipient's receiver
      receiverRef.deposit(from: <-self.sentVault)
    }
  }
`
