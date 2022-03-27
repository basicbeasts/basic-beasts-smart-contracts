export const RETIRE_BEAST = `
import BasicBeasts from 0xBasicBeasts

transaction(beastTemplateID: UInt32) {

    let adminRef: &BasicBeasts.Admin

    prepare(acct: AuthAccount) {
        self.adminRef = acct.borrow<&BasicBeasts.Admin>(from: BasicBeasts.AdminStoragePath)
            ?? panic("No Admin resource in storage")
    }

    execute {
        self.adminRef.retireBeast(beastTemplateID: beastTemplateID)
    }

    post {
        BasicBeast.isBeastRetired(beastTemplateID: beastTemplateID) == true:
            "BeastTemplate is not retired"
    }

}
`
