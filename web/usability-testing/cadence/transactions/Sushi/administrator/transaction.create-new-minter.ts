export const SUSHI_CREATE_NEW_MINTER = `
import Sushi from 0xSushi

transaction {
    prepare (acct: AuthAccount) {
      let adminRef = acct.borrow<&Sushi.Administrator>(from: Sushi.AdminStoragePath) ?? panic("Could not borrow admin reference")
      acct.save(<- adminRef.createNewMinter(), to: Sushi.MinterStoragePath)
    }
}
`
