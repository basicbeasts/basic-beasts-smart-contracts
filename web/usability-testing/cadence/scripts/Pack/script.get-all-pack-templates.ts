export const GET_ALL_PACK_TEMPLATES = `
import Pack from 0xPack

pub fun main(): {UInt32: Pack.PackTemplate} {
  return Pack.getAllPackTemplates()
}
`
