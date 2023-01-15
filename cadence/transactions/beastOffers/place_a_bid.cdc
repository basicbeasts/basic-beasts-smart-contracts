import FungibleToken from "./../../../cadence/flow/FungibleToken.cdc"
import FUSD from "./../../../cadence/flow/FUSD.cdc"
import NonFungibleToken from "./../../../cadence/flow/NonFungibleToken.cdc"
import MetadataViews from "./../../../cadence/flow/MetadataViews.cdc"
import BasicBeasts from "./../../../cadence/contracts/BasicBeasts.cdc"
import BeastOffers from "./../../../cadence/contracts/BeastOffers.cdc"

transaction(offerAmount: UFix64, beastID: UInt64) {

    
    let collectionRef: &BeastOffers.OfferCollection
    let beastReceiverCapability: Capability<&BasicBeasts.Collection{BasicBeasts.BeastCollectionPublic}>
    let vaultRefCapability: Capability<&FUSD.Vault{FungibleToken.Provider, FungibleToken.Balance}>

    prepare(acct: AuthAccount) {

        let vaultRefPrivatePath = /private/fusdVaultRefBeastOffers

        //Link the Beast collection
        if acct.borrow<&BasicBeasts.Collection{BasicBeasts.BeastCollectionPublic}>(from: BasicBeasts.CollectionStoragePath) == nil {
            acct.save(<- BasicBeasts.createEmptyCollection(), to: BasicBeasts.CollectionStoragePath)
            acct.unlink(BasicBeasts.CollectionPublicPath)
            acct.link<&BasicBeasts.Collection{NonFungibleToken.Receiver, 
                NonFungibleToken.CollectionPublic, 
                BasicBeasts.BeastCollectionPublic, 
                MetadataViews.ResolverCollection}>
                (BasicBeasts.CollectionPublicPath, target: BasicBeasts.CollectionStoragePath)
        }
        //Link the Offer collection
        if acct.borrow<&BeastOffers.OfferCollection>(from: BeastOffers.CollectionStoragePath) == nil {
            acct.save(<-BeastOffers.createOfferCollection(), to: BeastOffers.CollectionStoragePath)
            acct.unlink(BeastOffers.CollectionPublicPath)
            acct.link<&BeastOffers.OfferCollection{BeastOffers.OfferCollectionPublic}>(BeastOffers.CollectionPublicPath, target: BeastOffers.CollectionStoragePath)
        }
        //Link the private FUSD vault capability
        if !acct.getCapability<&FUSD.Vault{FungibleToken.Provider, FungibleToken.Balance}>(vaultRefPrivatePath).check() {
            acct.link<&FUSD.Vault{FungibleToken.Provider, FungibleToken.Balance}>(vaultRefPrivatePath, target: /storage/fusdVault)
        }

        //Get the offer collection reference
        self.collectionRef = acct.borrow<&BeastOffers.OfferCollection>(from: BeastOffers.CollectionStoragePath)
            ?? panic("Missing or mis-typed BeastOffers.OfferCollection")
        
        //Get the capability to the offeror's Beast collection
        self.beastReceiverCapability = acct.getCapability<&BasicBeasts.Collection{BasicBeasts.BeastCollectionPublic}>(BasicBeasts.CollectionPublicPath)

        //Get the private capability to the offeror's FUSD vault
        self.vaultRefCapability = acct.getCapability<&FUSD.Vault{FungibleToken.Provider, FungibleToken.Balance}>(vaultRefPrivatePath)
        assert(self.vaultRefCapability.check(), message: "Missing or mis-typed FUSD vault provider")
        
    }

    execute {
        self.collectionRef.makeOffer(vaultRefCapability: self.vaultRefCapability, beastReceiverCapability: self.beastReceiverCapability, amount: offerAmount, beastID: beastID)
    }

}

 