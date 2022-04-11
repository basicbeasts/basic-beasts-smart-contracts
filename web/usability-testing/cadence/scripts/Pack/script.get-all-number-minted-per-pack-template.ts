export const GET_ALL_NUMBER_MINTED_PER_PACK_TEMPLATE = `
import Pack from 0xPack

pub fun main(): {UInt32: UInt32} {
  return Pack.getAllNumberMintedPerPackTemplate()
}
`
