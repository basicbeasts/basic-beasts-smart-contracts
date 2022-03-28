export const GET_NUM_MINTED_PER_BEAST_TEMPLATE = `
import BasicBeasts from 0xBasicBeasts

pub fun main(beastTemplateID: UInt32): UInt32? {
  return BasicBeasts.getNumMintedPerBeastTemplate(beastTemplateID: beastTemplateID)
}
`
