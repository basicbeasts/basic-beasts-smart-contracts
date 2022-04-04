export const IS_EVOLVER_INITIALIZED = `
import Evolution from 0xEvolution

pub fun hasEvolver(_ address: Address): Bool {
    return getAccount(address)
      .getCapability<&Evolution.Evolver{Evolution.Public}>(Evolution.EvolverPublicPath)
      .check()
  }

pub fun main(address: Address): Bool {
  return hasEvolver(address)
}
`
