export const PAUSE_PUBLIC_EVOLUTION = `
import Evolution from 0xEvolution

transaction() {
    let adminRef: &Evolution.Admin

  prepare(acct: AuthAccount) {
    self.adminRef = acct.borrow<&Evolution.Admin>(from: Evolution.AdminStoragePath)
    ?? panic("No Admin resource in storage")

  }

  execute {

    self.adminRef.pausePublicEvolution()

  }
}

`
