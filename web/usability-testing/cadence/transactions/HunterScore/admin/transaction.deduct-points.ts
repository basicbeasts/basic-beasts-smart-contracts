export const DEDUCT_POINTS = `
import HunterScore from 0xHunterScore

transaction(wallet: Address, pointsToDeduct: UInt32) {
    let adminRef: &HunterScore.Admin

  prepare(acct: AuthAccount) {
    self.adminRef = acct.borrow<&HunterScore.Admin>(from: HunterScore.AdminStoragePath)
    ?? panic("No Admin resource in storage")
  }

  execute {
    self.adminRef.deductPoints(wallet: wallet, pointsToDeduct: pointsToDeduct)
  }
}
`
