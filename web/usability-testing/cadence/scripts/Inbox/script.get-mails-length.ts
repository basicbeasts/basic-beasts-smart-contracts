export const GET_MAILS_LENGTH = `
import Inbox from 0xInbox

pub fun main(adminAcct: Address): Int {

    let centralizedInboxRef = getAccount(adminAcct).getCapability(Inbox.CentralizedInboxPublicPath)
        .borrow<&Inbox.CentralizedInbox{Inbox.Public}>()
        ?? panic("Could not get Centralized Inbox reference")

  return centralizedInboxRef.getMailsLength()
}
`
