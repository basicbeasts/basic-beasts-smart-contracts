import BasicBeasts from "./BasicBeasts.cdc"

pub contract HunterScore {
    access(self) var hunterScores: {Address: UInt32}

    access(self) var beastsCollected: {Address: [UInt64]}

    // {String = beastTemplate.skin: {UInt32 = beastTemplate.starLevel: UInt32 = pointReward}}
    access(self) var pointTable: {String: UInt32}

    access(account) fun increaseHunterScore(wallet: Address, beasts: @BasicBeasts.Collection): @BasicBeasts.Collection {

        // Initialize array if wallet is not in dictionray
        if(HunterScore.beastsCollected[wallet] == nil) {
            HunterScore.beastsCollected[wallet] = []
        }

        //Calculate points
        var points: UInt32 = 0

        for id in beasts.getIDs() {
            if(!HunterScore.beastsCollected[wallet]!.contains(id)) {
                // Add points depending on skin and star level
                var beast = beasts.borrowBeast(id: id)!
                var skinAndStarLevel = beast.getBeastTemplate().skin.concat(" ").concat(beast.getBeastTemplate().starLevel.toString())
                
                if(HunterScore.pointTable[skinAndStarLevel] != nil) {
                    points = points + HunterScore.pointTable[skinAndStarLevel]!
                    
                    // Add ID into beastsCollected
                    HunterScore.beastsCollected[wallet]!.append(id)
                }
            }
        }

        if(HunterScore.hunterScores[wallet] != nil) {
            HunterScore.hunterScores[wallet] = HunterScore.hunterScores[wallet]! + points
        } else {
            HunterScore.hunterScores[wallet] = points
        }

        return <- beasts

    }

    init() {
        self.hunterScores = {}
        self.beastsCollected = {}
        self.pointTable = {
            "Normal 1": 10,
            "Normal 2": 30,
            "Normal 3": 90,
            "Metallic Silver 1": 50,
            "Metallic Silver 2": 150,
            "Metallic Silver 3": 450,
            "Cursed Black 1": 300,
            "Cursed Black 2": 900,
            "Cursed Black 3": 2700,
            "Shiny Gold 1": 1000,
            "Shiny Gold 2": 3000,
            "Shiny Gold 3": 9000,
            "Mythic Diamond 1": 10000,
            "Mythic Diamond 2": 10000,
            "Mythic Diamond 3": 10000
        }
    }
}