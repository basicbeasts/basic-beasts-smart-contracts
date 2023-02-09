export const MINT_LOVE_POTION = `
import LovePotionMinter from 0xLovePotionMinter
import LovePotion from 0xLovePotion
import Sushi from 0xSushi
import Poop from 0xPoop
import EmptyPotionBottle from 0xEmptyPotionBottle
import MetadataViews from 0xMetadataViews
import NonFungibleToken from 0xNonFungibleToken


transaction(quantity: UInt64) {

    prepare(acct: AuthAccount) {

        if acct.borrow<&LovePotion.Collection{LovePotion.LovePotionCollectionPublic}>(from: LovePotion.CollectionStoragePath) == nil {
                    acct.save(<- LovePotion.createEmptyCollection(), to: LovePotion.CollectionStoragePath)
                    acct.unlink(LovePotion.CollectionPublicPath)
                    acct.link<&LovePotion.Collection{NonFungibleToken.Receiver, 
                        NonFungibleToken.CollectionPublic, 
                        LovePotion.LovePotionCollectionPublic, 
                        MetadataViews.ResolverCollection}>
                        (LovePotion.CollectionPublicPath, target: LovePotion.CollectionStoragePath)
                }

        //Get the love potion collection reference
        let collectionRef = acct.borrow<&LovePotion.Collection>(from: LovePotion.CollectionStoragePath)
            ?? panic("Couldn't get a reference to the Love Potion collection")

        let sushiRef = acct.borrow<&Sushi.Vault>(from: Sushi.VaultStoragePath)
            ?? panic("Couldn't get a reference to the suhsi vault")

        let poopRef = acct.borrow<&Poop.Vault>(from: Poop.VaultStoragePath)
            ?? panic("Couldn't get a reference to the suhsi vault")
        
        let emptyPotionBottleRef = acct.borrow<&EmptyPotionBottle.Vault>(from: EmptyPotionBottle.VaultStoragePath)
            ?? panic("Couldn't get a reference to the suhsi vault")

        let sushi <-sushiRef.withdraw(amount: 5.0) as! @Sushi.Vault

        let poop <- poopRef.withdraw(amount: 5.0) as! @Poop.Vault

        let emptyPotionBottle <- emptyPotionBottleRef.withdraw(amount: 1.0) as! @EmptyPotionBottle.Vault

        let lovePotion <- LovePotionMinter.mintLovePotion(sushi: <-sushi, poop: <-poop, emptyPotionBottle: <-emptyPotionBottle)
        
        collectionRef.deposit(token: <-lovePotion)
        
    }

}
`
