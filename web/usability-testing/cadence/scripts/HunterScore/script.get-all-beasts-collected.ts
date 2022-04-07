export const GET_ALL_BEASTS_COLLECTED = `
import HunterScore from 0xHunterScore

pub fun main(): {Address: [UInt64]} {
  return HunterScore.getAllBeastsCollected()
}
`
