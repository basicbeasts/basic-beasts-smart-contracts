import LovePotion from "./LovePotion.cdc"
import Sushi from "./Sushi.cdc"
import Poop from "./Poop.cdc"
import EmptyPotionBottle from "./EmptyPotionBottle.cdc"
import FungibleToken from "../flow/FungibleToken.cdc"

pub contract LovePotionMinter {

    // -----------------------------------------------------------------------
    // Named Paths
    // -----------------------------------------------------------------------
    pub let AdminStoragePath: StoragePath
    pub let AdminPrivatePath: PrivatePath

    // -----------------------------------------------------------------------
    // LovePotionMinter Fields
    // -----------------------------------------------------------------------
    pub var sushiRequirement: UFix64
    pub var poopRequirement: UFix64
    pub var emptyPotionBottleRequirement: UFix64

    pub fun mintLovePotion(sushi: @Sushi.Vault, poop: @Poop.Vault, emptyPotionBottle: @EmptyPotionBottle.Vault): @LovePotion.NFT {
        pre {
            sushi.balance == LovePotionMinter.sushiRequirement: "Cannot mint love potion: Sushi must be the exact required amount"
            poop.balance == LovePotionMinter.poopRequirement: "Cannot mint love potion: Poop must be the exact required amount"
            emptyPotionBottle.balance == LovePotionMinter.emptyPotionBottleRequirement: "Cannot mint love potion: Empty Potion Bottle must be the exact required amount"
        }

        // Transfer the sushi and poop to the admin
        let sushiReceiver = self.account.getCapability(Sushi.ReceiverPublicPath)
                                                                    .borrow<&{FungibleToken.Receiver}>()
                                                                    ?? panic("Could not borrow receiver reference to the admin's sushi vault")
        sushiReceiver.deposit(from: <-sushi)

        let poopReceiver = self.account.getCapability(Poop.ReceiverPublicPath)
                                                                    .borrow<&{FungibleToken.Receiver}>()
                                                                    ?? panic("Could not borrow receiver reference to the admin's poop vault")
        poopReceiver.deposit(from: <-poop)

        // Destroy the empty potion bottle
        destroy emptyPotionBottle

        return <-LovePotion.mint()
    }

    pub resource Admin {

        pub fun changeSushiRequirement(sushiRequired: UFix64) {
            LovePotionMinter.sushiRequirement = sushiRequired
        }

        pub fun changePoopRequirement(poopRequired: UFix64) {
            LovePotionMinter.poopRequirement = poopRequired
        }

        pub fun createNewAdmin(): @Admin {
            return <-create Admin()
        }

    }

    init() {
        // Initialize contract fields
        self.sushiRequirement = 5.0
        self.poopRequirement = 5.0
        self.emptyPotionBottleRequirement = 1.0

        // Set the named paths
        self.AdminStoragePath = /storage/basicBeastsLovePotionMinterAdmin
        self.AdminPrivatePath = /private/basicBeastsLovePotionMinterAdminUpgrade


    }

}