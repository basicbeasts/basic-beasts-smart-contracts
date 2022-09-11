export const GET_WALLET_MAILS = `
import Inbox from 0xInbox
import Pack from 0xPack
import NonFungibleToken from 0xNonFungibleToken

pub fun main(adminAcct: Address, wallet: Address): [&Pack.NFT{Pack.Public}] {
  var packCollection: [&Pack.NFT{Pack.Public}] = []

  let centralizedInboxRef = getAccount(adminAcct).getCapability(Inbox.CentralizedInboxPublicPath)
        .borrow<&Inbox.CentralizedInbox{Inbox.Public}>()
        ?? panic("Could not get Centralized Inbox reference")
  
  let IDs = centralizedInboxRef.getIDs(wallet: wallet)

  if (IDs != nil) {
    for id in IDs! {
      let pack = centralizedInboxRef.borrowPack(wallet: wallet, id: id)!
          
      packCollection.append(pack)
    }
  }
  

  return packCollection
}
`
