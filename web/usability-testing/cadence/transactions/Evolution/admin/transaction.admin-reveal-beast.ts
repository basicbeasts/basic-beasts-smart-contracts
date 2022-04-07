export const ADMIN_REVEAL_BEAST = `
import Evolution from 0xEvolution
import BasicBeasts from 0xBasicBeasts

transaction(beastID: UInt64, firstOwner: Address) {
    let adminRef: &Evolution.Admin
    let collectionRef: &BasicBeasts.Collection

  prepare(acct: AuthAccount) {
    self.adminRef = acct.borrow<&Evolution.Admin>(from: Evolution.AdminStoragePath)
    ?? panic("No Admin resource in storage")

    self.collectionRef = acct.borrow<&BasicBeasts.Collection>(from: BasicBeasts.CollectionStoragePath)
    ?? panic("No Collection resource in storage")

  }

  execute {

    let beastToReveal <- self.collectionRef.withdraw(withdrawID: beastID) as! @BasicBeasts.NFT

    let beast <- self.adminRef.revealEvolvedBeast(beast: <-beastToReveal, firstOwner: firstOwner)

    self.collectionRef.deposit(token: <- beast)

  }
}

`
