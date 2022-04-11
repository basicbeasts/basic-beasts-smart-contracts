export const CREATE_PACK_TEMPLATE = `
import Pack from 0xPack

transaction(
            packTemplateID: UInt32, 
            name: String,
            image: String,
            description: String,
            ) {

    let adminRef: &Pack.Admin

    prepare(acct: AuthAccount) {
        self.adminRef = acct.borrow<&Pack.Admin>(from: Pack.AdminStoragePath)
            ?? panic("No admin resource in storage")
    }
    execute {
        self.adminRef.createPackTemplate(
                                        packTemplateID: packTemplateID, 
                                        name: name,
                                        image: image,
                                        description: description,
        )
    }

}
`
