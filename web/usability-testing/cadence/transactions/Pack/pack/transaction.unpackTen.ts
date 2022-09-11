export const UNPACK_TEN = `        
import Pack from 0xPack
import BasicBeasts from 0xBasicBeasts
import EmptyPotionBottle from 0xEmptyPotionBottle
import Poop from 0xPoop
import Sushi from 0xSushi
import FungibleToken from 0xFungibleToken
import NonFungibleToken from 0xNonFungibleToken
import MetadataViews from 0xMetadataViews

pub fun hasSushiVault(_ address: Address): Bool {
  return getAccount(address)
    .getCapability<&Sushi.Vault{FungibleToken.Balance}>(Sushi.BalancePublicPath)
    .check()
}

pub fun hasPoopVault(_ address: Address): Bool {
  return getAccount(address)
    .getCapability<&Poop.Vault{FungibleToken.Balance}>(Poop.BalancePublicPath)
    .check()
}

pub fun hasEmptyPotionBottleVault(_ address: Address): Bool {
  return getAccount(address)
    .getCapability<&EmptyPotionBottle.Vault{FungibleToken.Balance}>(EmptyPotionBottle.BalancePublicPath)
    .check()
}

transaction(packs: [UInt64], to: Address) {

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

        if !hasEmptyPotionBottleVault(acct.address) {
          if acct.borrow<&EmptyPotionBottle.Vault>(from: EmptyPotionBottle.VaultStoragePath) == nil {
            acct.save(<-EmptyPotionBottle.createEmptyVault(), to: EmptyPotionBottle.VaultStoragePath)
          }
          acct.unlink(EmptyPotionBottle.ReceiverPublicPath)
          acct.unlink(EmptyPotionBottle.BalancePublicPath)
    
            acct.link<&EmptyPotionBottle.Vault{FungibleToken.Receiver}>(
              EmptyPotionBottle.ReceiverPublicPath,
                target: EmptyPotionBottle.VaultStoragePath
            )
    
            acct.link<&EmptyPotionBottle.Vault{FungibleToken.Balance}>(
              EmptyPotionBottle.BalancePublicPath,
                target: EmptyPotionBottle.VaultStoragePath
            )
        }
        self.emptyPotionBottleReceiverRef = getAccount(to).getCapability(EmptyPotionBottle.ReceiverPublicPath).borrow<&{FungibleToken.Receiver}>()!

        if !hasPoopVault(acct.address) {
          if acct.borrow<&Poop.Vault>(from: Poop.VaultStoragePath) == nil {
            acct.save(<-Poop.createEmptyVault(), to: Poop.VaultStoragePath)
          }
          acct.unlink(Poop.ReceiverPublicPath)
          acct.unlink(Poop.BalancePublicPath)
    
            acct.link<&Poop.Vault{FungibleToken.Receiver}>(
              Poop.ReceiverPublicPath,
                target: Poop.VaultStoragePath
            )
    
            acct.link<&Poop.Vault{FungibleToken.Balance}>(
              Poop.BalancePublicPath,
                target: Poop.VaultStoragePath
            )
        }
      
        self.poopReceiverRef = getAccount(to).getCapability(Poop.ReceiverPublicPath).borrow<&{FungibleToken.Receiver}>()!
        
        if !hasSushiVault(acct.address) {
          if acct.borrow<&Sushi.Vault>(from: Sushi.VaultStoragePath) == nil {
            acct.save(<-Sushi.createEmptyVault(), to: Sushi.VaultStoragePath)
          }
          acct.unlink(Sushi.ReceiverPublicPath)
          acct.unlink(Sushi.BalancePublicPath)
    
            acct.link<&Sushi.Vault{FungibleToken.Receiver}>(
                Sushi.ReceiverPublicPath,
                target: Sushi.VaultStoragePath
            )
    
            acct.link<&Sushi.Vault{FungibleToken.Balance}>(
                Sushi.BalancePublicPath,
                target: Sushi.VaultStoragePath
            )
        }
      
        self.sushiReceiverRef = getAccount(to).getCapability(Sushi.ReceiverPublicPath).borrow<&{FungibleToken.Receiver}>()!

    }

    execute {

      var index = 0
      while packs.length > index {
        let pack <- self.packCollectionRef.withdraw(withdrawID: packs[index]) as! @Pack.NFT

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

        index = index + 1
      }

        
        
    }

}
`
