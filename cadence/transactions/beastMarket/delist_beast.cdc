import BeastMarket from "./../../../cadence/contracts/BeastMarket.cdc"

transaction(beastID: UInt64) {

    prepare(acct: AuthAccount) {
        // borrow a reference to the sale
        let saleCollection = acct.borrow<&BeastMarket.SaleCollection>(from: BeastMarket.CollectionStoragePath)
            ?? panic("Could not borrow from sale in storage")
        
        // put the beast up for sale
        saleCollection.cancelSale(tokenID: beastID)
        
    }
}