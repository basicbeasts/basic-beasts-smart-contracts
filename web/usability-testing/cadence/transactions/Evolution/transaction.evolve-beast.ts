export const EVOLVE_BEAST = `
import Evolution from 0xEvolution
import BasicBeasts from 0xBasicBeasts

transaction(ID1: UInt64, ID2: UInt64, ID3: UInt64) {
    let evolverRef: &Evolution.Evolver
    let collectionRef: &BasicBeasts.Collection

  prepare(acct: AuthAccount) {
    self.evolverRef = acct.borrow<&Evolution.Evolver>(from: Evolution.EvolverStoragePath)
    ?? panic("No Evolver resource in storage")

    self.collectionRef = acct.borrow<&BasicBeasts.Collection>(from: BasicBeasts.CollectionStoragePath)
    ?? panic("No Collection resource in storage")

  }

  execute {
      let tempCollection <- BasicBeasts.createEmptyCollection() as! @BasicBeasts.Collection

      tempCollection.deposit(token: <-self.collectionRef.withdraw(withdrawID: ID1))
      tempCollection.deposit(token: <-self.collectionRef.withdraw(withdrawID: ID2))
      tempCollection.deposit(token: <-self.collectionRef.withdraw(withdrawID: ID3))

    let collection <- self.evolverRef.evolveBeast(beasts: <- tempCollection)

    for id in collection.getIDs() {
        self.collectionRef.deposit(token: <- collection.withdraw(withdrawID: id))
    }
    destroy collection
  }
}

`
