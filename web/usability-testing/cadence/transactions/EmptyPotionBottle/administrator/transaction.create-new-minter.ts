export const EMPTY_POTION_BOTTLE_CREATE_NEW_MINTER = `
import EmptyPotionBottle from 0xEmptyPotionBottle

transaction {
    prepare (acct: AuthAccount) {
      let adminRef = acct.borrow<&EmptyPotionBottle.Administrator>(from: EmptyPotionBottle.AdminStoragePath) ?? panic("Could not borrow admin reference")
      acct.save(<- adminRef.createNewMinter(), to: EmptyPotionBottle.MinterStoragePath)
    }
}
`
