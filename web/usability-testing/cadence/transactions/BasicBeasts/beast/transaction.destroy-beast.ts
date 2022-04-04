export const DESTROY_BEAST = `
import BasicBeasts from 0xBasicBeasts
import NonFungibleToken from 0xNonFungibleToken

transaction(withdrawID: UInt64) {

    let beast: @NonFungibleToken.NFT

    prepare(acct: AuthAccount) {

        let collectionRef = acct.borrow<&BasicBeasts.Collection>(from: BasicBeasts.CollectionStoragePath)
            ?? panic("Could not borrow a reference to the stored Beast collection")

        self.beast <- collectionRef.withdraw(withdrawID: withdrawID)

    }

    execute {

        destroy self.beast

    }
}

`
