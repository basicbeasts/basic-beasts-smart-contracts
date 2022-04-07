export const GET_HUNTER_SCORES = `
import HunterScore from 0xHunterScore

pub fun main(): {Address: UInt32} {
  return HunterScore.getHunterScores()
}
`
