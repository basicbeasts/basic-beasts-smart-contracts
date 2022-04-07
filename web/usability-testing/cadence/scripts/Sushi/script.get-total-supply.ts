export const GET_SUSHI_TOTAL_SUPPLY = `
import Sushi from 0xSushi

pub fun main(): UFix64 {
    return Sushi.totalSupply
}
`
