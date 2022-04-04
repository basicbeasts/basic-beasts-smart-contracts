export const ADD_MYTHIC_PAIR = `
import Evolution from 0xEvolution

transaction(evolvedID: UInt32, mythicID: UInt32) {
    let adminRef: &Evolution.Admin

  prepare(acct: AuthAccount) {
    self.adminRef = acct.borrow<&Evolution.Admin>(from: Evolution.AdminStoragePath)
    ?? panic("No Admin resource in storage")
  }

  execute {
    self.adminRef.addMythicPair(beastTemplateID: evolvedID, mythicBeastTemplateID: mythicID)
  }
}
`
