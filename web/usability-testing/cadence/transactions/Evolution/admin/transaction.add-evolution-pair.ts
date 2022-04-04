export const ADD_EVOLUTION_PAIR = `
import Evolution from 0xEvolution

transaction(lowerLevelID: UInt32, higherLevelID: UInt32) {
    let adminRef: &Evolution.Admin

  prepare(acct: AuthAccount) {
    self.adminRef = acct.borrow<&Evolution.Admin>(from: Evolution.AdminStoragePath)
    ?? panic("No Admin resource in storage")
  }

  execute {
    self.adminRef.addEvolutionPair(beastTemplateID: lowerLevelID, evolvedBeastTemplateID: higherLevelID)
  }
}
`
