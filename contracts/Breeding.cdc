import BasicBeasts from "./BasicBeasts.cdc"
import Egg from "./Egg.cdc"
import LovePotion from "./LovePotion.cdc"

//TODO: Admin resource to pause breeding
//TODO: Admin can it have a breed function as well. Where the user propose a transaction using their beasts and lovepotion? So it could work in a backend where admin authorize the transaction
pub contract Breeding {

    access(self) var breedingCounts: {UInt64: UInt32}

    pub let maxBreedingCount: UInt32

    //TODO: If we use references in this case. Is anyone able to just use other's beasts to breed? As BeastCollectionPublic would allow them to borrow a beast 
    pub fun breed(matron: &BasicBeasts.NFT, sire: &BasicBeasts.NFT, lovePotion: @LovePotion.Vault): @Egg.NFT {
        pre {
            !self.breedingCountReached(beastID: matron.id): "Cannot breed beasts: Matron's breeding count is reached"
            !self.breedingCountReached(beastID: sire.id): "Cannot breed beasts: Sire's breeding count is reached"
            lovePotion.balance == 1.0: "Cannot breed beasts: Love potion must be exactly 1.0"
            matron.getBeastTemplate().breedableBeastTemplateID == sire.getBeastTemplate().breedableBeastTemplateID: "Cannot breed beasts: Sire and Matron are different species"
            !matron.getBeastTemplate().asexual: "Cannot breed beasts: Matron is asexual"
            !sire.getBeastTemplate().asexual: "Cannot breed beasts: Sire is asexual"
            matron.sex == "Female": "Cannot breed beasts: Matron is not Female"
            sire.sex == "Male": "Cannot breed beasts: Sire is not Male"
        }

        let matronStruct = BasicBeasts.BeastNftStruct(
                                                id: matron.id, 
                                                serialNumber: matron.serialNumber, 
                                                sex: matron.sex, 
                                                beastTemplateID: matron.getBeastTemplate().beastTemplateID, 
                                                beneficiary: matron.getBeneficiary()
                                                )

        let sireStruct = BasicBeasts.BeastNftStruct(
                                                id: sire.id, 
                                                serialNumber: sire.serialNumber, 
                                                sex: sire.sex, 
                                                beastTemplateID: sire.getBeastTemplate().beastTemplateID, 
                                                beneficiary: sire.getBeneficiary()
                                                )

        let beast <- BasicBeasts.mintBeast(beastTemplateID: matron.getBeastTemplate().breedableBeastTemplateID, matron: matronStruct, sire: sireStruct, evolvedFrom: nil)

        let newEgg <- Egg.mintEgg(matron: matronStruct, sire: sireStruct, beast: <-beast)

        self.breedingCounts[matron.id] = self.breedingCounts[matron.id]! + 1

        self.breedingCounts[sire.id] = self.breedingCounts[sire.id]! + 1

        destroy lovePotion

        return <- newEgg
    }

    pub fun breedingCountReached(beastID: UInt64): Bool {

        if(self.breedingCounts[beastID] != nil) {
            return self.breedingCounts[beastID]! >= self.maxBreedingCount
        }

        self.breedingCounts[beastID] = 0

        return false
    }

    init() {
        self.breedingCounts = {}
        self.maxBreedingCount = 6
    }

}