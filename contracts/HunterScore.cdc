import BasicBeasts from "./BasicBeasts.cdc"

pub contract HunterScore {
    access(self) var hunterScores: {Address: UInt64}

    access(self) var beastsCollected: {Address: [UInt64]}

    access(account) fun increaseHunterScore(wallet: Address, beasts: @BasicBeasts.Collection): @BasicBeasts.Collection {

        //Calculate points
        var points: UInt64 = 0

        for id in beasts.getIDs() {
            if(!HunterScore.beastsCollected[wallet]!.contains(id)) {
                // Add points depending on star level and skin
                // Add ID into beastsCollected
            }
        }

        let previousPoints = HunterScore.hunterScores[wallet]!

        if(previousPoints != nil) {
            HunterScore.hunterScores[wallet] = previousPoints + points
        } else {
            HunterScore.hunterScores[wallet] = points
        }

        return <- beasts

    }

    init() {
        self.hunterScores = {}
        self.beastsCollected = {}
    }
}