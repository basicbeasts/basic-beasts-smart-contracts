export const ADMIN_EVOLVE_BEAST = `
import Evolution from 0xEvolution
import BasicBeasts from 0xBasicBeasts

transaction(ID1: UInt64, ID2: UInt64, ID3: UInt64, isMythic: Bool, firstOwner: Address) {
    let adminRef: &Evolution.Admin
    let collectionRef: &BasicBeasts.Collection

  prepare(acct: AuthAccount) {
    self.adminRef = acct.borrow<&Evolution.Admin>(from: Evolution.AdminStoragePath)
    ?? panic("No Admin resource in storage")

    self.collectionRef = acct.borrow<&BasicBeasts.Collection>(from: BasicBeasts.CollectionStoragePath)
    ?? panic("No Collection resource in storage")

  }

  execute {
      let tempCollection <- BasicBeasts.createEmptyCollection() as! @BasicBeasts.Collection

      tempCollection.deposit(token: <-self.collectionRef.withdraw(withdrawID: ID1))
      tempCollection.deposit(token: <-self.collectionRef.withdraw(withdrawID: ID2))
      tempCollection.deposit(token: <-self.collectionRef.withdraw(withdrawID: ID3))

    let collection <- self.adminRef.evolveBeast(beasts: <- tempCollection, isMythic: isMythic, firstOwner: firstOwner)

    for id in collection.getIDs() {
        self.collectionRef.deposit(token: <- collection.withdraw(withdrawID: id))
    }
    destroy collection
  }
}

`
