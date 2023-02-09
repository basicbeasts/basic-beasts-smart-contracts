import { FC, useEffect, useState } from "react"
import TestSection, { TestSectionStyles } from "@components/ui/TestSection"
import styled from "styled-components"
import FuncButton from "@components/ui/FuncButton"
import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
import {
  query,
  send,
  transaction,
  args,
  arg,
  payer,
  proposer,
  authorizations,
  limit,
  authz,
  decode,
  tx,
} from "@onflow/fcl"
import { CREATE_PACK_MAIL } from "@cadence/transactions/Inbox/centralizedInbox/transaction.create-pack-mail"
import batch from "data/batch_1"
import { authorizationFunction } from "authorization"
import { GET_SUSHI_BALANCE } from "@cadence/scripts/Sushi/script.get-balance"
import { GET_POOP_BALANCE } from "@cadence/scripts/Poop/script.get-balance"
import { GET_EMPTY_POTION_BOTTLE_BALANCE } from "@cadence/scripts/EmptyPotionBottle/script.get-balance"
import { GET_LOVE_POTION_BALANCE } from "@cadence/scripts/LovePotion/script.get-balance"
import { MINT_LOVE_POTION } from "@cadence/transactions/LovePotionMinter/transaction.mint-love-potion"

const ActionItem = styled.div`
  padding: 10px 0;
`

const Column = styled.div`
  align-items: center;
  display: flex;
`

type Props = {
  id: any
  title: String
  user: any
}

const MintLovePotion: FC<Props> = ({ id, title, user }) => {
  const [sushi, setSushi] = useState<any>(0)
  const [poop, setPoop] = useState<any>(0)
  const [bottle, setBottle] = useState<any>(0)
  const [lovePotion, setLovePotion] = useState<any>(0)
  const [qty, setQty] = useState<any>(1)

  useEffect(() => {
    getSushi()
    getPoop()
    getBottle()
    getLovePotion()
  }, [user?.addr])

  const mintLovePotion = async () => {
    try {
      const res = await send([
        transaction(MINT_LOVE_POTION),
        args([arg(qty, t.UInt64)]),
        payer(authz),
        proposer(authz),
        authorizations([authz]),
        limit(9999),
      ]).then(decode)
      await tx(res).onceSealed()
      getSushi()
      getPoop()
      getBottle()
      getLovePotion()
    } catch (err) {
      console.log(err)
    }
  }

  const getSushi = async () => {
    try {
      let response = await query({
        cadence: GET_SUSHI_BALANCE,
        args: (arg: any, t: any) => [arg(user?.addr, t.Address)],
      })
      setSushi(response)
    } catch (err) {
      console.log(err)
    }
  }

  const getPoop = async () => {
    try {
      let response = await query({
        cadence: GET_POOP_BALANCE,
        args: (arg: any, t: any) => [arg(user?.addr, t.Address)],
      })
      setPoop(response)
    } catch (err) {
      console.log(err)
    }
  }

  const getBottle = async () => {
    try {
      let response = await query({
        cadence: GET_EMPTY_POTION_BOTTLE_BALANCE,
        args: (arg: any, t: any) => [arg(user?.addr, t.Address)],
      })
      setBottle(response)
    } catch (err) {
      console.log(err)
    }
  }

  const getLovePotion = async () => {
    try {
      let response = await query({
        cadence: GET_LOVE_POTION_BALANCE,
        args: (arg: any, t: any) => [arg(user?.addr, t.Address)],
      })
      setLovePotion(response)
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <TestSectionStyles>
      <TestSection id={id} title={title}>
        <h3>Sushi Balance: {parseInt(sushi)}</h3>
        <h3>Poop Balance: {parseInt(poop)}</h3>
        <h3>Empty Bottle Balance: {parseInt(bottle)}</h3>
        <h3>Love Potion Balance: {parseInt(lovePotion)}</h3>
        <h3>Mint Love Potion</h3>
        <FuncButton onClick={() => mintLovePotion()}>
          MintLovePotion()
        </FuncButton>
        <FuncButton
          onClick={() => {
            getPoop()
            getBottle()
            getSushi()
            getLovePotion()
          }}
        >
          Refresh balances
        </FuncButton>
      </TestSection>
    </TestSectionStyles>
  )
}

export default MintLovePotion
