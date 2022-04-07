export const GET_ALL_BANNED = `
import HunterScore from 0xHunterScore

pub fun main(): [Address] {
  return HunterScore.getAllBanned()
}
`
