import NonFungibleToken from "../../../../cadence/flow/NonFungibleToken.cdc"
import BasicBeasts from "../../../../cadence/contracts/BasicBeasts.cdc"

// This transaction configures an account to hold Kitty Items.

transaction {
    prepare(signer: AuthAccount) {
        // if the account doesn't already have a collection
        if signer.borrow<&BasicBeasts.Collection>(from: BasicBeasts.CollectionStoragePath) == nil {
            // create a new empty collection
            let collection <- BasicBeasts.createEmptyCollection()
            
            // save it to the account
            signer.save(<-collection, to: BasicBeasts.CollectionStoragePath)

            // create a public capability for the collection
            signer.link<&BasicBeasts.Collection{NonFungibleToken.CollectionPublic, BasicBeasts.BeastCollectionPublic}>
            (BasicBeasts.CollectionPublicPath, 
            target: BasicBeasts.CollectionStoragePath)
        }
    }
}