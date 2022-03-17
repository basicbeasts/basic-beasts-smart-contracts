import BasicBeasts from "./BasicBeasts.cdc"
import Egg from "./Egg.cdc"

pub contract Breeding {

    access(self) var breedingCounts: {UInt64: UInt32}

    pub let maxBreedingCount: UInt32

    pub fun breed(): @Egg.NFT {
        let matron = BasicBeasts.BeastNftStruct()
        let sire = BasicBeasts.BeastNftStruct()
        Egg.mintEgg(matron: matron, sire: sire, beast: beast)
        return <- newEgg
    }

    pub fun isBreedable(beastID: UInt64): Bool? {

        if(self.breedingCounts[beastID] != nil) {
            return self.breedingCounts[beastID]! < self.maxBreedingCount
        }

        return nil
    }

    init() {
        self.breedingCounts = {}
        self.maxBreedingCount = 6
    }

}