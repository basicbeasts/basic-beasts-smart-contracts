export const PUBLIC_BREED = `
import LovePotionMinter from 0xLovePotionMinter
import LovePotion from 0xLovePotion
import Breeding from 0xBreeding
import BasicBeasts from 0xBasicBeasts
import Egg from 0xEgg
import NonFungibleToken from 0xNonFungibleToken
import MetadataViews from 0xMetadataViews

transaction(matronID: UInt64, sireID: UInt64) {

    prepare(acct: AuthAccount) {

        if acct.borrow<&Egg.Collection{Egg.EggCollectionPublic}>(from: Egg.CollectionStoragePath) == nil {
                    acct.save(<- Egg.createEmptyCollection(), to: Egg.CollectionStoragePath)
                    acct.unlink(Egg.CollectionPublicPath)
                    acct.link<&Egg.Collection{NonFungibleToken.Receiver, 
                        NonFungibleToken.CollectionPublic, 
                        Egg.EggCollectionPublic, 
                        MetadataViews.ResolverCollection}>
                        (Egg.CollectionPublicPath, target: Egg.CollectionStoragePath)
                }

        let eggCollectionRef = acct.borrow<&Egg.Collection>(from: Egg.CollectionStoragePath)
            ?? panic("Couldn't get a reference to the egg collection")

        let lovePotionCollectionRef = acct.borrow<&LovePotion.Collection>(from: LovePotion.CollectionStoragePath)
            ?? panic("Couldn't get a reference to the Love Potion collection")

        let beastCollectionRef = acct.borrow<&BasicBeasts.Collection>(from: BasicBeasts.CollectionStoragePath)
            ?? panic("Couldn't get a reference to the beast collection")

        let beastReceiver = acct.getCapability<&BasicBeasts.Collection{BasicBeasts.BeastCollectionPublic}>(BasicBeasts.CollectionPublicPath)

        let IDs = lovePotionCollectionRef.getIDs()

        let lovePotion <- lovePotionCollectionRef.withdraw(withdrawID: IDs[0]) as! @LovePotion.NFT

        let matron <- beastCollectionRef.withdraw(withdrawID: matronID) as! @BasicBeasts.NFT
        let sire <- beastCollectionRef.withdraw(withdrawID: sireID) as! @BasicBeasts.NFT

        let egg <- Breeding.publicBreed(matron: <-matron, sire: <-sire, lovePotion: <-lovePotion, beastReceiver: beastReceiver)
        
        eggCollectionRef.deposit(token: <-egg)
    }

}
`
