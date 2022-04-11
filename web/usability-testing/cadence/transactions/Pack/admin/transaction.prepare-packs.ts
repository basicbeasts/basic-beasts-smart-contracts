// Arguments: [Pack.id], beastTemplateID
// Mint and Insert Fungible Tokens
// Mint and Insert Beasts
// Important: Exception in transaction if a pack is to contain a Mythic Diamond.
// https://filesplit.org/ is needed

export const PREPARE_PACKS = `
import Pack from 0xPack
import BasicBeasts from 0xBasicBeasts
import EmptyPotionBottle from 0xEmptyPotionBottle
import Poop from 0xPoop
import Sushi from 0xSushi


//Check if beast skin and pack type match (Should be commented out if a pack is to contains a Mythic Diamond)
pub fun isMatching(packType: String, beastSkin: String): Bool {
    return (beastSkin == "Normal" && packType == "Starter" || beastSkin == packType) 
}

transaction(packs: [UInt64], beastTemplateID: UInt32) {

    let packAdminRef: &Pack.Admin
    let basicBeastsAdminRef: &BasicBeasts.Admin
    let emptyPotionBottleMinterRef: &EmptyPotionBottle.Minter
    let poopMinterRef: &Poop.Minter
    let sushiMinterRef: &Sushi.Minter
    let packAdminCollectionRef: &Pack.Collection

    prepare(acct: AuthAccount) {
        self.packAdminRef = acct.borrow<&Pack.Admin>(from: Pack.AdminStoragePath) ?? panic("Could not borrow admin pack reference")
        self.basicBeastsAdminRef = acct.borrow<&BasicBeasts.Admin>(from: BasicBeasts.AdminStoragePath) ?? panic("Could not borrow admin basic beasts reference")
        self.packAdminCollectionRef = acct.borrow<&Pack.Collection>(from: Pack.CollectionStoragePath) ?? panic("Could not borrow pack collection reference")

        let emptyPotionBottleAdminRef = acct.borrow<&EmptyPotionBottle.Administrator>(from: EmptyPotionBottle.AdminStoragePath) ?? panic("Could not borrow admin empty potion bottle reference")
        let poopAdminRef = acct.borrow<&Poop.Administrator>(from: Poop.AdminStoragePath) ?? panic("Could not borrow admin poop reference")
        let sushiAdminRef = acct.borrow<&Sushi.Administrator>(from: Sushi.AdminStoragePath) ?? panic("Could not borrow admin sushi reference")
        
        if acct.borrow<&EmptyPotionBottle.Minter>(from: EmptyPotionBottle.MinterStoragePath) == nil {
            acct.save(<- emptyPotionBottleAdminRef.createNewMinter(), to: EmptyPotionBottle.MinterStoragePath)
        }
        self.emptyPotionBottleMinterRef = acct.borrow<&EmptyPotionBottle.Minter>(from: EmptyPotionBottle.MinterStoragePath)!

        if acct.borrow<&Poop.Minter>(from: Poop.MinterStoragePath) == nil {
            acct.save(<- poopAdminRef.createNewMinter(), to: Poop.MinterStoragePath)
        }
        self.poopMinterRef = acct.borrow<&Poop.Minter>(from: Poop.MinterStoragePath)!

        if acct.borrow<&Sushi.Minter>(from: Sushi.MinterStoragePath) == nil {
            acct.save(<- sushiAdminRef.createNewMinter(), to: Sushi.MinterStoragePath)
        }
        self.sushiMinterRef = acct.borrow<&Sushi.Minter>(from: Sushi.MinterStoragePath)!
    }

    execute {

        let newPackCollection <- Pack.createEmptyCollection() as! @Pack.Collection

        var i = 0
        while i < packs.length {
            let emptyPack <- self.packAdminCollectionRef.withdraw(withdrawID: packs[i]) as! @Pack.NFT

            // Mint and Insert Fungibles
            // 1x Empty Potion Bottle
            let emptyPotionBottleVault <- self.emptyPotionBottleMinterRef.mintTokens(amount: 1.00)
            let epbFilledPack <- self.packAdminRef.insertFungible(pack: <-emptyPack, vault: <-emptyPotionBottleVault)

            // 3x Poop
            let poopVault <- self.poopMinterRef.mintTokens(amount: 3.00)
            let poopFilledPack <- self.packAdminRef.insertFungible(pack: <-epbFilledPack, vault: <-poopVault)

            // 7x Sushi
            let sushiVault <- self.sushiMinterRef.mintTokens(amount: 7.00)
            let sushiFilledPack <- self.packAdminRef.insertFungible(pack: <-poopFilledPack, vault: <-sushiVault)

            // Mint and Insert Beast
            let newBeast <- self.basicBeastsAdminRef.mintBeast(beastTemplateID: beastTemplateID)

            if !isMatching(packType: sushiFilledPack.packTemplate.name, beastSkin: newBeast.getBeastTemplate().skin) {
                panic("Beast Skin and Pack Type does not match")
            }

            let preparedPack <- self.packAdminRef.insertBeast(pack: <-sushiFilledPack, beast: <-newBeast)

            newPackCollection.deposit(token: <- preparedPack)

            i = i + 1
        }

        let IDs = newPackCollection.getIDs()

        i = 0
        while i < IDs.length {
            self.packAdminCollectionRef.deposit(token: <-newPackCollection.withdraw(withdrawID: IDs[i]))
            i = i + 1 
        }

        destroy newPackCollection

    }

}

`
