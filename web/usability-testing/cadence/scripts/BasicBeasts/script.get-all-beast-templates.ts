export const GET_ALL_BEAST_TEMPLATES = `
import BasicBeasts from 0xBasicBeasts

pub fun main(): {UInt32 : BasicBeasts.BeastTemplate} {
  return BasicBeasts.getAllBeastTemplates()
}
`
