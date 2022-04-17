export const GET_ALL_NUMBER_MINTED_PER_BEAST_TEMPLATE = `
import BasicBeasts from 0xBasicBeasts

pub fun main(): {UInt32 : UInt32} {
  return BasicBeasts.getAllNumberMintedPerBeastTemplate()
}
`
