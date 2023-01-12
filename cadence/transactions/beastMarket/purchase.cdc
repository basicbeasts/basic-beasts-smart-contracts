import FungibleToken from "./../../../cadence/flow/FungibleToken.cdc"
import FUSD from "./../../../cadence/flow/FUSD.cdc"
import BasicBeasts from "./../../../cadence/contracts/BasicBeasts.cdc"
import BeastMarket from "./../../../cadence/contracts/BeastMarket.cdc"

transaction(sellerAddress: Address, beastID: UInt64, purchaseAmount: UFix64) {
    prepare(acct: AuthAccount) {
        // borrow a reference to the signer's collection
        let collection = acct.borrow<&BasicBeasts.Collection>(from: BasicBeasts.CollectionStoragePath)
            ?? panic("Could not borrow reference to the Beast Collection")

        // borrow a reference to the signer's fusd token Vault
        let provider = acct.borrow<&FUSD.Vault{FungibleToken.Provider}>(from: /storage/fusdVault)!
        
        // withdraw tokens from the signer's vault
        let tokens <- provider.withdraw(amount: purchaseAmount) as! @FUSD.Vault

        // get the seller's public account object
        let seller = getAccount(sellerAddress)

        // borrow a public reference to the seller's sale collection
        let saleCollection = seller.getCapability(BeastMarket.CollectionPublicPath)
            .borrow<&BeastMarket.SaleCollection{BeastMarket.SalePublic}>()
            ?? panic("Could not borrow public sale reference")
    
        // purchase the moment
        let purchasedBeast <- saleCollection.purchase(tokenID: beastID, buyTokens: <-tokens, buyer: acct.address)

        // deposit the purchased moment into the signer's collection
        collection.deposit(token: <-purchasedBeast)
    }

}

 