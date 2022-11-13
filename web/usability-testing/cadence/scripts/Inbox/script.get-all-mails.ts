export const GET_ALL_MAILS = `
import Inbox from 0xInbox
import NonFungibleToken from 0xNonFungibleToken

pub fun main(adminAcct: Address): &[NonFungibleToken.NFT]? {

  let centralizedInboxRef = getAccount(adminAcct).getCapability(Inbox.CentralizedInboxPublicPath)
      .borrow<&Inbox.CentralizedInbox{Inbox.Public}>()
      ?? panic("Could not get Centralized Inbox reference")

return centralizedInboxRef.getWalletMails(wallet: Address)
}
`
