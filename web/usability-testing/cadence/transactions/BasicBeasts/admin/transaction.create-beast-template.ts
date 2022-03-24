export const CREATE_BEAST_TEMPLATE = `
import BasicBeasts from 0xBasicBeasts

transaction(
            beastTemplateID: UInt32, 
            dexNumber: UInt32,
            name: String,
            description: String,
            image: String,
            imageTransparentBg: String,
            animation_url: String?,
            external_url: String?,
            rarity: String,
            skin: String,
            starLevel: UInt32, 
            asexual: Bool,
            breedableBeastTemplateID: UInt32,
            maxAdminMintAllowed: UInt32,
            ultimateSkill: String,
            basicSkills: [String],
            elements: [String],
            data: {String: String}
            ) {
    let adminRef: &BasicBeasts.Admin

    prepare(acct: AuthAccount) {
        self.adminRef = acct.borrow<&BasicBeasts.Admin>(from: BasicBeasts.AdminStoragePath)
            ?? panic("No admin resource in storage")
    }
    execute {
        self.adminRef.createBeastTemplate(
                                        beastTemplateID: beastTemplateID, 
                                        dexNumber: dexNumber,
                                        name: name,
                                        description: description,
                                        image: image,
                                        imageTransparentBg: imageTransparentBg,
                                        animation_url: animation_url,
                                        external_url: external_url,
                                        rarity: rarity,
                                        skin: skin,
                                        starLevel: starLevel, 
                                        asexual: asexual,
                                        breedableBeastTemplateID: breedableBeastTemplateID,
                                        maxAdminMintAllowed: maxAdminMintAllowed,
                                        ultimateSkill: ultimateSkill,
                                        basicSkills: basicSkills,
                                        elements: elements,
                                        data: data
        )
    }

    post {
        BasicBeasts.getBeastTemplate(beastTemplateID: beastTemplateID) != nil:
            "BeastTemplate doesn't exist"
    }
            }
`
