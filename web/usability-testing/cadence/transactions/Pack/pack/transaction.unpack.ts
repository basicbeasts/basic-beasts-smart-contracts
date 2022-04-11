export const UNPACK = `
import Pack from 0xPack
import BasicBeasts from 0xBasicBeasts
import EmptyPotionBottle from 0xEmptyPotionBottle
import Poop from 0xPoop
import Sushi from 0xSushi
import FungibleToken from 0xFungibleToken
import NonFungibleToken from 0xNonFungibleToken
import MetadataViews from 0xMetadataViews

transaction(packID: UInt64, to: Address) {

    let packCollectionRef: &Pack.Collection
    let packManagerRef: &Pack.PackManager
    let beastReceiverRef: &BasicBeasts.Collection{BasicBeasts.BeastCollectionPublic}
    let emptyPotionBottleReceiverRef: &{FungibleToken.Receiver}
    let poopReceiverRef: &{FungibleToken.Receiver}
    let sushiReceiverRef: &{FungibleToken.Receiver}


    prepare(acct: AuthAccount) {

        self.packCollectionRef = acct.borrow<&Pack.Collection>(from: Pack.CollectionStoragePath) ?? panic("Could not borrow pack collection reference")

        if acct.borrow<&BasicBeasts.Collection{BasicBeasts.BeastCollectionPublic}>(from: BasicBeasts.CollectionStoragePath) == nil {
            acct.save(<- BasicBeasts.createEmptyCollection(), to: BasicBeasts.CollectionStoragePath)
            acct.unlink(BasicBeasts.CollectionPublicPath)
            acct.link<&BasicBeasts.Collection{NonFungibleToken.Receiver, 
                NonFungibleToken.CollectionPublic, 
                BasicBeasts.BeastCollectionPublic, 
                MetadataViews.ResolverCollection}>
                (BasicBeasts.CollectionPublicPath, target: BasicBeasts.CollectionStoragePath)
        }
        self.beastReceiverRef = acct.borrow<&BasicBeasts.Collection{BasicBeasts.BeastCollectionPublic}>(from: BasicBeasts.CollectionStoragePath)!
        
        if acct.borrow<&Pack.PackManager>(from: Pack.PackManagerStoragePath) == nil {
            acct.save(<- Pack.createNewPackManager(), to: Pack.PackManagerStoragePath)
            acct.unlink(Pack.PackManagerPublicPath)
            acct.link<&Pack.PackManager{Pack.PublicPackManager}>
                (Pack.PackManagerPublicPath, target: Pack.PackManagerStoragePath)
        }
        self.packManagerRef = acct.borrow<&Pack.PackManager>(from: Pack.PackManagerStoragePath)!

        if getAccount(to).getCapability(EmptyPotionBottle.ReceiverPublicPath).borrow<&{FungibleToken.Receiver}>() == nil {
            acct.save(<-EmptyPotionBottle.createEmptyVault(), to: EmptyPotionBottle.VaultStoragePath)
            acct.unlink(EmptyPotionBottle.ReceiverPublicPath)
            acct.unlink(EmptyPotionBottle.BalancePublicPath)
            acct.link<&EmptyPotionBottle.Vault{FungibleToken.Receiver}>(
                EmptyPotionBottle.ReceiverPublicPath,
                target: EmptyPotionBottle.VaultStoragePath
            )
        }
        self.emptyPotionBottleReceiverRef = getAccount(to).getCapability(EmptyPotionBottle.ReceiverPublicPath).borrow<&{FungibleToken.Receiver}>()!

        if getAccount(to).getCapability(Poop.ReceiverPublicPath).borrow<&{FungibleToken.Receiver}>() == nil {
            acct.save(<-Poop.createEmptyVault(), to: Poop.VaultStoragePath)
            acct.unlink(Poop.ReceiverPublicPath)
            acct.unlink(Poop.BalancePublicPath)
            acct.link<&Poop.Vault{FungibleToken.Receiver}>(
                Poop.ReceiverPublicPath,
                target: Poop.VaultStoragePath
            )
        }
        self.poopReceiverRef = getAccount(to).getCapability(Poop.ReceiverPublicPath).borrow<&{FungibleToken.Receiver}>()!
        
        if getAccount(to).getCapability(Sushi.ReceiverPublicPath).borrow<&{FungibleToken.Receiver}>() == nil {
            acct.save(<-Sushi.createEmptyVault(), to: Sushi.VaultStoragePath)
            acct.unlink(Sushi.ReceiverPublicPath)
            acct.unlink(Sushi.BalancePublicPath)
            acct.link<&Sushi.Vault{FungibleToken.Receiver}>(
                Sushi.ReceiverPublicPath,
                target: Sushi.VaultStoragePath
            )
        }
        self.sushiReceiverRef = getAccount(to).getCapability(Sushi.ReceiverPublicPath).borrow<&{FungibleToken.Receiver}>()!

    }

    execute {

        let pack <- self.packCollectionRef.withdraw(withdrawID: packID) as! @Pack.NFT

        let fungibles <- pack.retrieveAllFungibleTokens()

        let length = fungibles.length

        var i = 0
        while i < length {
            var fungibleVault <- fungibles.remove(at: 0)
            var balance = fungibleVault.balance

            if fungibleVault.isInstance(Type<@EmptyPotionBottle.Vault>()) {
                self.emptyPotionBottleReceiverRef.deposit(from: <- fungibleVault)

            } else if fungibleVault.isInstance(Type<@Poop.Vault>()) {
                self.poopReceiverRef.deposit(from: <- fungibleVault)

            } else if fungibleVault.isInstance(Type<@Sushi.Vault>()) {
                self.sushiReceiverRef.deposit(from: <- fungibleVault)
            } else {
                fungibles.append(<-fungibleVault)
            }
            i = i + 1
        }

        let beastCollection <- self.packManagerRef.retrieveBeast(pack: <-pack)

        let IDs = beastCollection.getIDs()

        let beast <- beastCollection.withdraw(withdrawID: IDs[0])

        self.beastReceiverRef.deposit(token: <-beast)

        destroy fungibles
        destroy beastCollection
        
    }

}
`
