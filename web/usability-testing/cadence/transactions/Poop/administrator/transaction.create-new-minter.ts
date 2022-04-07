export const POOP_CREATE_NEW_MINTER = `
import Poop from 0xPoop

transaction {
    prepare (acct: AuthAccount) {
      let adminRef = acct.borrow<&Poop.Administrator>(from: Poop.AdminStoragePath) ?? panic("Could not borrow admin reference")
      acct.save(<- adminRef.createNewMinter(), to: Poop.MinterStoragePath)
    }
}
`
