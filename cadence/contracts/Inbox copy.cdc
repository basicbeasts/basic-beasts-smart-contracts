import NonFungibleToken from "../flow/NonFungibleToken.cdc"
import Pack from "./Pack.cdc"

// Food for thought
// 1. Should the resource 'mails' that contain the packs or just the packs themselves or any NFT be stored as a contract field or in another resource owned by the admin account?
// Pros and cons? Or doesn't matter?
// Pro of resource inbox is that another account could hold a inbox resource.


// Purpose: Allow for the admin to send pack NFTs, and any other NFTs to an inbox 
// that allows the recipients to claim their items at any time.

// Testing: https://play.onflow.org/197af814-2e7c-4772-b7d0-9e8754da6cb7

pub contract Inbox {
    
    // -----------------------------------------------------------------------
    // Inbox Events
    // -----------------------------------------------------------------------
    // TODO events

    // -----------------------------------------------------------------------
    // Named Paths
    // -----------------------------------------------------------------------
    pub let CentralizedInboxStoragePath: StoragePath
    pub let CentralizedInboxPrivatePath: PrivatePath
    pub let CentralizedInboxPublicPath: PublicPath

    // -----------------------------------------------------------------------
    // Inbox Fields
    // -----------------------------------------------------------------------
    access(self) var stockNumbers: {UInt64: Address}

    pub struct PackData {
        pub let id: UInt64
        pub let packTemplateID: UInt32
        pub let packName: String
        pub let packImage: String
        pub let description: String
        pub let stockNumber: UInt64
        pub let serialNumber: UInt32

        init(id: UInt64, packTemplateID: UInt32, packName: String, packImage: String, description: String, stockNumber: UInt64, serialNumber: UInt32) {
            self.id = id
            self.packTemplateID = packTemplateID
            self.packName = packName
            self.packImage = packImage
            self.description = description
            self.stockNumber = stockNumber
            self.serialNumber = serialNumber
        }
    }

    //TODO: Remove old get functions that use references
    pub resource interface Public {
        pub fun claimMails(recipient: &{NonFungibleToken.Receiver})
        //pub fun getAllMails(): &{Address:[NonFungibleToken.NFT]}
        pub fun getAllMails(): {Address: [PackData]}
        //pub fun getWalletMails(wallet: Address): &[NonFungibleToken.NFT]?
        pub fun getWalletMails(wallet: Address): [PackData]?
        pub fun getMailsLength(): Int
    }

    pub resource CentralizedInbox: Public {
        access(self) var mails: @{Address:[NonFungibleToken.NFT]}

        init() {
            self.mails <- {}
        }

        pub fun claimMails(recipient: &{NonFungibleToken.Receiver}) {
            let wallet = recipient.owner!.address

            if(self.mails[wallet] != nil && self.mails[wallet]?.length! > 0) {
                while self.mails[wallet]?.length! > 0 {
                    let token <- self.mails[wallet]?.remove(at: 0)!
                    recipient.deposit(token: <-token)
                }
                //self.mails[wallet] <-! nil
            }

        }

        // pub fun getAllMails(): &{Address:[NonFungibleToken.NFT]} {
        //     return &self.mails as! &{Address:[NonFungibleToken.NFT]}
        // }

        pub fun getAllMails(): {Address: [PackData]} {
            let mails = &self.mails as! &{Address:[NonFungibleToken.NFT]}
            let addresses = mails.keys

            // For each address
            for address in addresses {
                // get the packs/array
                let packs = &mails[address] as! &[NonFungibleToken.NFT]

                let packDataArr: [PackData] = []

                // For each pack/array copy the pack data
                for pack in packs {

                    // append the pack data to an array of pack data

                }
            }

            return 
        }

        pub fun getWalletMails(wallet: Address): &[NonFungibleToken.NFT]? {
            if (self.mails[wallet] != nil) {
                return &self.mails[wallet] as! &[NonFungibleToken.NFT]
            }
            return nil
        }

        pub fun createPackMail(wallet: Address, NFTs: @Pack.Collection) {
            let IDs = NFTs.getIDs()

            if(self.mails[wallet] == nil) {
                self.mails[wallet] <-! []
            }

            for id in IDs {
                let nft = NFTs.borrowPack(id: id)!

                if(Inbox.stockNumbers.keys.contains(nft.stockNumber)) {
                    panic("Can't create mail: StockNumber has already been used.")
                } else {
                    Inbox.stockNumbers[nft.stockNumber] = wallet
                }
                
                self.mails[wallet]?.append(<- NFTs.withdraw(withdrawID: id))
            }

            destroy NFTs
        }

        //For testing
        pub fun getMailsLength(): Int {
            return self.mails.length
        }

        pub fun createNewCentralizedInbox(): @CentralizedInbox {
            return <-create CentralizedInbox()
        }

        // This won't work if we don't remove the self.mails[wallet] array after claiming mails.
        destroy() {
            pre {
                self.mails.length == 0: "Can't destroy: mails are left in the inbox"
            }
            destroy self.mails
        }
    }

    init() {
        // Set named paths
        self.CentralizedInboxStoragePath = /storage/BasicBeastsCentralizedInbox
        self.CentralizedInboxPrivatePath = /private/BasicBeastsCentralizedInboxUpgrade
        self.CentralizedInboxPublicPath = /public/BasicBeastsCentralizedInbox

        self.stockNumbers = {}

        // Put CentralizedInbox in storage
        self.account.save(<-create CentralizedInbox(), to: self.CentralizedInboxStoragePath)

        self.account.link<&Inbox.CentralizedInbox>(self.CentralizedInboxPrivatePath, target: self.CentralizedInboxStoragePath) 
                                                ?? panic("Could not get a capability to the Centralized Inbox")

        self.account.link<&Inbox.CentralizedInbox{Public}>(self.CentralizedInboxPublicPath, target: self.CentralizedInboxStoragePath) 
                                                ?? panic("Could not get a capability to the Centralized Inbox")
    }
}