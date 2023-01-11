import FungibleToken from "./../../../cadence/flow/FungibleToken.cdc"
import FUSD from "./../../../cadence/flow/FUSD.cdc"
import BasicBeasts from "./../../../cadence/contracts/BasicBeasts.cdc"
import BeastMarket from "./../../../cadence/contracts/BeastMarket.cdc"

transaction(beastID: UInt64, price: UFix64) {

    prepare(acct: AuthAccount) {
        // check for FUSD vault
        if acct.borrow<&FUSD.Vault>(from: /storage/fusdVault) == nil {
            // Create a new FUSD Vault and put it in storage
            acct.save(<-FUSD.createEmptyVault(), to: /storage/fusdVault)

            // Create a public capability to the Vault that only exposes
            // the deposit function through the Receiver interface
            acct.link<&FUSD.Vault{FungibleToken.Receiver}>(
                /public/fusdReceiver,
                target: /storage/fusdVault
            )

            // Create a public capability to the Vault that only exposes
            // the balance field through the Balance interface
            acct.link<&FUSD.Vault{FungibleToken.Balance}>(
                /public/fusdBalance,
                target: /storage/fusdVault
            )
        }

        // check to see if a sale collection already exists
        if acct.borrow<&BeastMarket.SaleCollection>(from: BeastMarket.CollectionStoragePath) == nil {
            // get the fungible token capabilities for the owner and beneficiary
            let ownerCapability = acct.getCapability<&FUSD.Vault{FungibleToken.Receiver}>(/public/fusdReceiver)

            let ownerCollection = acct.link<&BasicBeasts.Collection>(BasicBeasts.CollectionPrivatePath, target: BasicBeasts.CollectionStoragePath)!

            // create a new sale collection
            let saleCollection <- BeastMarket.createSaleCollection(ownerCollection: ownerCollection, ownerCapability: ownerCapability)
            
            // save it to storage
            acct.save(<-saleCollection, to: BeastMarket.CollectionStoragePath)
        
            // create a public link to the sale collection
            acct.link<&BeastMarket.SaleCollection{BeastMarket.SalePublic}>(BeastMarket.CollectionPublicPath, target: BeastMarket.CollectionStoragePath)
        }

        // borrow a reference to the sale
        let saleCollection = acct.borrow<&BeastMarket.SaleCollection>(from: BeastMarket.CollectionStoragePath)
            ?? panic("Could not borrow from sale in storage")
        
        // put the beast up for sale
        saleCollection.listForSale(tokenID: beastID, price: price)
        
    }
}
 