import NonFungibleToken from "../flow/NonFungibleToken.cdc"

// Food for thought
// 1. Should the resource 'mails' that contain the packs or just the packs themselves or any NFT be stored as a contract field or in another resource owned by the admin account?
// Pros and cons? Or doesn't matter?
// Pro of resource inbox is that another account could hold a inbox resource.


// Purpose: Allow for the admin to send pack NFTs, and any other NFTs to an inbox 
// that allows the recipients to claim their items at any time.

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

    // -----------------------------------------------------------------------
    // Inbox Fields
    // -----------------------------------------------------------------------
    access(self) var stockNumbers: {UInt64: Address}

    pub resource interface Public {
        pub fun redeemMails(recipient: &{NonFungibleToken.Receiver})
        pub fun getAllMails(): &{Address:[NonFungibleToken.NFT]}
    }

    pub resource CentralizedInbox: Public {
        access(self) var mails: @{Address:[NonFungibleToken.NFT]}

        init() {
            self.mails <- {}
        }

        pub fun redeemMails(recipient: &{NonFungibleToken.Receiver}) {
            let wallet = recipient.owner!.address

            if(self.mails[wallet] != nil && self.mails[wallet]?.length! > 0) {
                while self.mails[wallet]?.length! > 0 {
                    let token <- self.mails[wallet]?.remove(at: 0)!
                    recipient.deposit(token: <-token)
                }
                self.mails[wallet] <-! nil
            }

        }

        pub fun getAllMails(): &{Address:[NonFungibleToken.NFT]} {
            return &self.mails as! &{Address:[NonFungibleToken.NFT]}
        }

        pub fun createMail(wallet: Address, NFTs: @NonFungibleToken.Collection) {
            let IDs = NFTs.getIDs()

            if(self.mails[wallet] == nil) {
                self.mails[wallet] <-! []
            }

            for id in IDs {
                self.mails[wallet]?.append(<- NFTs.withdraw(withdrawID: id))
            }

            destroy NFTs
        }

        pub fun createNewCentralizedInbox(): @CentralizedInbox {
            return <-create CentralizedInbox()
        }

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

        self.stockNumbers = {}

        // Put CentralizedInbox in storage
        self.account.save(<-create CentralizedInbox(), to: self.CentralizedInboxStoragePath)

        self.account.link<&Inbox.CentralizedInbox>(self.CentralizedInboxPrivatePath, target: self.CentralizedInboxStoragePath) 
                                                ?? panic("Could not get a capability to the Centralized Inbox")
    }
}