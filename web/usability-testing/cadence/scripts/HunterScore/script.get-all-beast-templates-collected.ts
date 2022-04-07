export const GET_ALL_BEAST_TEMPLATES_COLLECTED = `
import HunterScore from 0xHunterScore

pub fun main(): {Address: [UInt32]} {
  return HunterScore.getAllBeastTemplatesCollected()
}
`
