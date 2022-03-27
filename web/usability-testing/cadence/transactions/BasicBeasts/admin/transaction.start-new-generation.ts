export const START_NEW_GENERATION = `
import BasicBeasts from 0xBasicBeasts

transaction {

    let adminRef: &BasicBeasts.Admin
    let currentGeneration: UInt32

    prepare(acct: AuthAccount) {
        self.adminRef = acct.borrow<&BasicBeasts.Admin>(from: BasicBeasts.AdminStoragePath)
            ?? panic("No Admin resource in storage")

        self.currentGeneration = BasicBeasts.currentGeneration

    }

    execute {
        self.adminRef.startNewGeneration()
    }

    post {
        BasicBeasts.currentGeneration == self.currentGeneration + 1 as UInt32:
            "New Generation is not started"
    }
}
`
