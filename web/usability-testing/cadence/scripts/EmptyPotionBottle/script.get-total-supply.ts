export const GET_EMPTY_POTION_BOTTLE_TOTAL_SUPPLY = `
import EmptyPotionBottle from 0xEmptyPotionBottle

pub fun main(): UFix64 {
    return EmptyPotionBottle.totalSupply
}
`
