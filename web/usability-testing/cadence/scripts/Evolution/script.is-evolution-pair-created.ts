export const IS_EVOLUTION_PAIR_CREATED = `
import Evolution from 0xEvolution

pub fun main(beastTemplateID: UInt32): Bool {
    let evolutionPairs = Evolution.getAllEvolutionPairs()
   return evolutionPairs.containsKey(beastTemplateID)
}
`
