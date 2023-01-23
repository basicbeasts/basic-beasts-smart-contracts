import BasicBeasts from "./BasicBeasts.cdc"
import Egg from "./Egg.cdc"
import LovePotion from "./LovePotion.cdc"

//TODO: Don't use breedRef
//TODO: Admin resource to pause breeding
//TODO: Admin can it have a breed function as well. Where the user propose a transaction using their beasts and lovepotion? So it could work in a backend where admin authorize the transaction
pub contract Breeding {

    // -----------------------------------------------------------------------
    // Breeding Events
    // -----------------------------------------------------------------------
    //TODO: Add events
    // -----------------------------------------------------------------------
    // Named Paths
    // -----------------------------------------------------------------------
    pub let AdminStoragePath: StoragePath
    pub let AdminPrivatePath: PrivatePath

    // -----------------------------------------------------------------------
    // Breeding Fields
    // -----------------------------------------------------------------------
    pub let maxBreedingCount: UInt32
    pub var publicBreedingPaused: Bool
    access(self) var breedingCounts: {UInt64: UInt32}

    // -----------------------------------------------------------------------
    // Admin Resource Functions
    //
    // Admin is a special authorization resource that 
    // allows the owner to perform important NFT functions
    // -----------------------------------------------------------------------
    pub resource Admin {

        pub fun adminBreed(
                        matron: @BasicBeasts.NFT, 
                        sire: @BasicBeasts.NFT, 
                        lovePotion: @LovePotion.Vault, 
                        beastReceiver: Capability<&BasicBeasts.Collection{BasicBeasts.BeastCollectionPublic}>
                        ): @Egg.NFT {
        return <- Breeding.breed(matron: <-matron, sire: <-sire, lovePotion: <-lovePotion, beastReceiver: beastReceiver)
    }
        
        pub fun pausePublicBreeding() {
            if(!Breeding.publicBreedingPaused) {
                Breeding.publicBreedingPaused = true
            }
        }

        pub fun startPublicBreeding() {
            if(Breeding.publicBreedingPaused) {
                Breeding.publicBreedingPaused = false
            }
        }

        pub fun createNewAdmin(): @Admin {
            return <-create Admin()
        }

    }

    pub fun publicBreed(
                    matron: @BasicBeasts.NFT, 
                    sire: @BasicBeasts.NFT, 
                    lovePotion: @LovePotion.Vault, 
                    beastReceiver: Capability<&BasicBeasts.Collection{BasicBeasts.BeastCollectionPublic}>
                    ): @Egg.NFT {
        pre {
            !self.publicBreedingPaused: "Can't publicBreed(): Public breeding is paused"
        }
        return <- self.breed(matron: <-matron, sire: <-sire, lovePotion: <-lovePotion, beastReceiver: beastReceiver)
    }

    //TODO: If we use references in this case. Is anyone able to just use other's beasts to breed? As BeastCollectionPublic would allow them to borrow a beast 
    //TODO: Remove lovepotion balance check as it will be an NFT
    access(account) fun breed(
                            matron: @BasicBeasts.NFT, 
                            sire: @BasicBeasts.NFT, 
                            lovePotion: @LovePotion.Vault, 
                            beastReceiver: Capability<&BasicBeasts.Collection{BasicBeasts.BeastCollectionPublic}>
                            ): @Egg.NFT {
        pre {
            !self.breedingCountReached(beastID: matron.id): "Cannot breed beasts: Matron's breeding count is reached"
            !self.breedingCountReached(beastID: sire.id): "Cannot breed beasts: Sire's breeding count is reached"
            lovePotion.balance == 1.0: "Cannot breed beasts: Love potion must be exactly 1.0"
            matron.getBeastTemplate().breedableBeastTemplateID == sire.getBeastTemplate().breedableBeastTemplateID: "Cannot breed beasts: Sire and Matron are different species"
            !matron.getBeastTemplate().asexual: "Cannot breed beasts: Matron is asexual"
            !sire.getBeastTemplate().asexual: "Cannot breed beasts: Sire is asexual"
            matron.sex == "Female": "Cannot breed beasts: Matron is not Female"
            sire.sex == "Male": "Cannot breed beasts: Sire is not Male"
            beastReceiver.check() : "Cannot breed beasts: beast receiver capability is invalid"
        }

        let matronStruct = BasicBeasts.BeastNftStruct(
                                                id: matron.id, 
                                                serialNumber: matron.serialNumber, 
                                                sex: matron.sex, 
                                                beastTemplateID: matron.getBeastTemplate().beastTemplateID, 
                                                firstOwner: matron.getFirstOwner()
                                                )

        let sireStruct = BasicBeasts.BeastNftStruct(
                                                id: sire.id, 
                                                serialNumber: sire.serialNumber, 
                                                sex: sire.sex, 
                                                beastTemplateID: sire.getBeastTemplate().beastTemplateID, 
                                                firstOwner: sire.getFirstOwner()
                                                )

        let beast <- BasicBeasts.mintBeast(beastTemplateID: matron.getBeastTemplate().breedableBeastTemplateID, matron: matronStruct, sire: sireStruct, evolvedFrom: nil)

        let newEgg <- Egg.mintEgg(matron: matronStruct, sire: sireStruct, beast: <-beast)

        if(self.breedingCounts[matron.id] != nil) {
            self.breedingCounts[matron.id] = self.breedingCounts[matron.id]! + 1
        } else {
            self.breedingCounts[matron.id] = 1
        }

        if(self.breedingCounts[sire.id] != nil) {
            self.breedingCounts[sire.id] = self.breedingCounts[sire.id]! + 1
        } else {
            self.breedingCounts[sire.id] = 1
        }

        beastReceiver.borrow()!.deposit(token: <-matron)
        beastReceiver.borrow()!.deposit(token: <-sire)

        destroy lovePotion

        return <- newEgg
    }

    pub fun breedingCountReached(beastID: UInt64): Bool {

        if(self.breedingCounts[beastID] != nil) {
            return self.breedingCounts[beastID]! >= self.maxBreedingCount
        }

        return false
    }

    init() {
        // Set named paths
        self.AdminStoragePath = /storage/BasicBeastsBreedingAdmin
        self.AdminPrivatePath = /private/BasicBeastsBreedingAdminUpgrade

        // Initialize the fields
        self.maxBreedingCount = 6
        self.publicBreedingPaused = false
        self.breedingCounts = {}

        // Put Admin in storage
        self.account.save(<-create Admin(), to: self.AdminStoragePath)

        self.account.link<&Breeding.Admin>(
            self.AdminPrivatePath,
            target: self.AdminStoragePath
        ) ?? panic("Could not get a capability to the admin")
    }

}