export const IS_PACK_MINTED = `
import Pack from 0xPack

pub fun main(stockNumber: UInt64): Bool {
  return Pack.isMinted(stockNumber: stockNumber)
}
`
