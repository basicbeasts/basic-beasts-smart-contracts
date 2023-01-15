import BeastMarket from "./../../../cadence/contracts/BeastMarket.cdc"
pub fun main(): UFix64 {
    return BeastMarket.highestSale
}