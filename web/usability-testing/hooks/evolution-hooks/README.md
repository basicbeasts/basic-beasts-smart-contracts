##Evolution.cdc

###Checklist

public functions:
createNewEvolver()

getAllEvolutionPairs()
getAllMythicPairs()

admin resource functions:
addEvolutionPair(beastTemplateID: UInt32, evolvedBeastTemplateID: UInt32)
addMythicPair(beastTemplateID: UInt32, mythicBeastTemplateID: UInt32)
evolveBeast(beasts: @BasicBeasts.Collection, isMythic: Bool, firstOwner: Address)
revealEvolvedBeast(beast: @BasicBeasts.NFT, firstOwner: Address)
pausePublicEvolution()
startPublicEvolution()

evolver resource functions:
evolveBeast(beasts: @BasicBeasts.Collection)

###TODO

public functions:
getAllNumEvolvedPerBeastTemplate(): {UInt32: UInt32}
getAllNumEvolvedPerBeastTemplateKeys()
getNumEvolvedPerBeastTemplate(beastTemplateID: UInt32)

getAllMythicPairsKeys()
getAllEvolutionPairsKeys()
getEvolvedBeastTemplateID(beastTemplateID: UInt32)

createNewAdmin()
