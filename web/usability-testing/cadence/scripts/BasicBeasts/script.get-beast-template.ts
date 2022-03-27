export const GET_BEAST_TEMPLATE = `
import BasicBeasts from 0xBasicBeasts

pub fun main(beastTemplateID: UInt32): BasicBeasts.BeastTemplate? {
  return BasicBeasts.getBeastTemplate(beastTemplateID: beastTemplateID)
}
`
