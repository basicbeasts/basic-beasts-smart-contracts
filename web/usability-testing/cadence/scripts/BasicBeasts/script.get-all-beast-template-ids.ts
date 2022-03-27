export const GET_ALL_BEAST_TEMPLATE_IDS = `
import BasicBeasts from 0xBasicBeasts

pub fun main(): [UInt32] {
  return BasicBeasts.getAllBeastTemplateIDs()
}
`
