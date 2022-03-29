export const TRANSFER_BEAST = `
import BasicBeasts from 0xBasicBeasts
import NonFungibleToken from 0xNonFungibleToken

transaction(recipient: Address, withdrawID: UInt64) {

    let transferToken: @NonFungibleToken.NFT

    prepare(acct: AuthAccount) {

        let collectionRef = acct.borrow<&BasicBeasts.Collection>(from: BasicBeasts.CollectionStoragePath)
            ?? panic("Could not borrow a reference to the stored Beast collection")

        self.transferToken <- collectionRef.withdraw(withdrawID: withdrawID)

    }

    execute {

        let recipient = getAccount(recipient)

        let receiverRef = recipient.getCapability(BasicBeasts.CollectionPublicPath)
        .borrow<&{BasicBeasts.BeastCollectionPublic}>()
        ?? panic("Could not get recipient's public beast collection reference")

        receiverRef.deposit(token: <-self.transferToken)

    }
}

`
