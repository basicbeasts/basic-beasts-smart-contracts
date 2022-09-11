export const GET_ADDRESSES = `
import Inbox from 0xInbox

pub fun main(adminAcct: Address): [Address] {

    let centralizedInboxRef = getAccount(adminAcct).getCapability(Inbox.CentralizedInboxPublicPath)
        .borrow<&Inbox.CentralizedInbox{Inbox.Public}>()
        ?? panic("Could not get Centralized Inbox reference")

  return centralizedInboxRef.getAddresses()
}
`
