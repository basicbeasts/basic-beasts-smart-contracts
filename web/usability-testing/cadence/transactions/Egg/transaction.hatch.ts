export const HATCH = `
import Egg from 0xEgg
import BasicBeasts from 0xBasicBeasts
import NonFungibleToken from 0xNonFungibleToken
import MetadataViews from 0xMetadataViews

transaction(eggID: UInt64) {

    prepare(acct: AuthAccount) {

        let eggCollectionRef = acct.borrow<&Egg.Collection>(from: Egg.CollectionStoragePath)
            ?? panic("Couldn't get a reference to the egg collection")

        if acct.borrow<&BasicBeasts.Collection{BasicBeasts.BeastCollectionPublic}>(from: BasicBeasts.CollectionStoragePath) == nil {
                    acct.save(<- BasicBeasts.createEmptyCollection(), to: BasicBeasts.CollectionStoragePath)
                    acct.unlink(BasicBeasts.CollectionPublicPath)
                    acct.link<&BasicBeasts.Collection{NonFungibleToken.Receiver, 
                        NonFungibleToken.CollectionPublic, 
                        BasicBeasts.BeastCollectionPublic, 
                        MetadataViews.ResolverCollection}>
                        (BasicBeasts.CollectionPublicPath, target: BasicBeasts.CollectionStoragePath)
                }

        let beastCollectionRef = acct.borrow<&BasicBeasts.Collection>(from: BasicBeasts.CollectionStoragePath)
            ?? panic("Couldn't get a reference to the egg collection")
            
        let eggRef = eggCollectionRef.borrowEntireEgg(id: eggID)
        
        let beast <- eggRef!.hatch()
        
        beastCollectionRef.deposit(token: <- beast) 
        
    }

}


`
