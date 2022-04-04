export const SETUP_EVOLVER = `
import Evolution from 0xEvolution

pub fun hasEvolver(_ address: Address): Bool {
  return getAccount(address)
    .getCapability<&Evolution.Evolver{Evolution.Public}>(Evolution.EvolverPublicPath)
    .check()
}

transaction {
  prepare(acct: AuthAccount) {
    if !hasEvolver(acct.address) {
      if acct.borrow<&Evolution.Evolver>(from: Evolution.EvolverStoragePath) == nil {
        acct.save(<-Evolution.createNewEvolver(), to: Evolution.EvolverStoragePath)
      }
      acct.unlink(Evolution.EvolverPublicPath)
      acct.link<&Evolution.Evolver{Evolution.Public}>(Evolution.EvolverPublicPath, target: Evolution.EvolverStoragePath)
    }
  }
}
`
