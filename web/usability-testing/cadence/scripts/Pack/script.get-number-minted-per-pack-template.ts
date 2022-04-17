export const GET_NUMBER_MINTED_PER_PACK_TEMPLATE = `
import Pack from 0xPack

pub fun main(packTemplateID: UInt32): UInt32? {
  return Pack.getNumberMintedPerPackTemplate(packTemplateID: packTemplateID)
}
`
