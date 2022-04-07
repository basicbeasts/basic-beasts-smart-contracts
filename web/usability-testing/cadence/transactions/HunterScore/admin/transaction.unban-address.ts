export const UNBAN_ADDRESS = `
import HunterScore from 0xHunterScore

transaction(wallet: Address) {
    let adminRef: &HunterScore.Admin

  prepare(acct: AuthAccount) {
    self.adminRef = acct.borrow<&HunterScore.Admin>(from: HunterScore.AdminStoragePath)
    ?? panic("No Admin resource in storage")
  }

  execute {
    self.adminRef.unbanAddress(wallet: wallet)
  }
}
`
