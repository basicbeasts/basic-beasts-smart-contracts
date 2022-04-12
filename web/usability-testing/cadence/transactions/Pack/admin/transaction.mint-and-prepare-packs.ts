export const MINT_AND_PREPARE_PACKS = `
import Pack from 0xPack
import BasicBeasts from 0xBasicBeasts
import EmptyPotionBottle from 0xEmptyPotionBottle
import Poop from 0xPoop
import Sushi from 0xSushi

//Check if beast skin and pack type match (Should be commented out if a pack is to contains a Mythic Diamond)
pub fun isMatching(packType: String, beastSkin: String): Bool {
    return (beastSkin == "Normal" && packType == "Starter" || beastSkin == packType) 
}

transaction(stockNumbers: [UInt64], packTemplateIDs: {UInt64: UInt32}, beastTemplateIDs: {UInt64: UInt32}) {

    let packAdminRef: &Pack.Admin
    let packAdminCollectionRef: &Pack.Collection{Pack.PackCollectionPublic}

    let basicBeastsAdminRef: &BasicBeasts.Admin
    let emptyPotionBottleMinterRef: &EmptyPotionBottle.Minter
    let poopMinterRef: &Poop.Minter
    let sushiMinterRef: &Sushi.Minter

    prepare(acct: AuthAccount) {
        self.packAdminRef = acct.borrow<&Pack.Admin>(from: Pack.AdminStoragePath)
            ?? panic("No Admin resource in storage")

        self.packAdminCollectionRef = acct.borrow<&Pack.Collection{Pack.PackCollectionPublic}>(from: Pack.CollectionStoragePath)
            ?? panic("Can't borrow a reference to the Admin's Pack collection")

        self.basicBeastsAdminRef = acct.borrow<&BasicBeasts.Admin>(from: BasicBeasts.AdminStoragePath) 
            ?? panic("Could not borrow admin basic beasts reference")
       
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

        var i = 0
        while i < stockNumbers.length {
            // Mint a Pack
            let stockNumber = stockNumbers[i]
            let newMintedPack <- self.packAdminRef.mintPack(stockNumber: stockNumber, packTemplateID: packTemplateIDs[stockNumber]!)

            // Mint and Insert Fungibles

            // 1x Empty Potion Bottle
            let emptyPotionBottleVault <- self.emptyPotionBottleMinterRef.mintTokens(amount: 1.00)
            let epbFilledPack <- self.packAdminRef.insertFungible(pack: <-newMintedPack, vault: <-emptyPotionBottleVault)

            // 3x Poop
            let poopVault <- self.poopMinterRef.mintTokens(amount: 3.00)
            let poopFilledPack <- self.packAdminRef.insertFungible(pack: <-epbFilledPack, vault: <-poopVault)

            // 7x Sushi
            let sushiVault <- self.sushiMinterRef.mintTokens(amount: 7.00)
            let sushiFilledPack <- self.packAdminRef.insertFungible(pack: <-poopFilledPack, vault: <-sushiVault)

            // Mint and Insert Beast
            let newBeast <- self.basicBeastsAdminRef.mintBeast(beastTemplateID: beastTemplateIDs[stockNumber]!)

            if !isMatching(packType: sushiFilledPack.packTemplate.name, beastSkin: newBeast.getBeastTemplate().skin) {
                panic("Beast Skin and Pack Type does not match")
            }

            let preparedPack <- self.packAdminRef.insertBeast(pack: <-sushiFilledPack, beast: <-newBeast)

            self.packAdminCollectionRef.deposit(token: <-preparedPack)

            i = i + 1
        }
        
    }

}
`
