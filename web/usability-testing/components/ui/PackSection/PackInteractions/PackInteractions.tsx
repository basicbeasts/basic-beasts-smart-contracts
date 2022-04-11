import { FC, useEffect, useState } from "react"
import FuncButton from "@components/ui/FuncButton"
import TestSection, { TestSectionStyles } from "@components/ui/TestSection"
import styled from "styled-components"
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
import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
import { GET_ALL_PACK_TEMPLATES } from "@cadence/scripts/Pack/script.get-all-pack-templates"
import { PREPARE_PACKS } from "@cadence/transactions/Pack/admin/transaction.prepare-packs"
import { FuncArgButton, FuncArgInput } from "@components/ui/FuncArgButton"
import packs from "data/packs"
import { GET_BEAST_COLLECTION } from "@cadence/scripts/BasicBeasts/script.get-beast-collection"
import { UNPACK } from "@cadence/transactions/Pack/pack/transaction.unpack"
import { GET_POOP_BALANCE } from "@cadence/scripts/Poop/script.get-balance"
import { GET_EMPTY_POTION_BOTTLE_BALANCE } from "@cadence/scripts/EmptyPotionBottle/script.get-balance"
import { GET_SUSHI_BALANCE } from "@cadence/scripts/Sushi/script.get-balance"

const ActionItem = styled.div`
  padding: 10px 0;
`

const TextAlert = styled.div`
  margin: 20px 0;
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

const PackInteractions: FC<Props> = ({ id, title, user }) => {
  const [beastTemplateID, setBeastTemplateID] = useState<any | undefined>(1)
  const [packID, setPackID] = useState<any | undefined>(1)

  const [adminCollection, setAdminCollection] = useState()
  const [sushiBalance, setSushiBalance] = useState()
  const [poopBalance, setPoopBalance] = useState()
  const [epbBalance, setEPBBalance] = useState()

  useEffect(() => {
    getAdminBeastCollection()
    getSushiBalance()
    getPoopBalance()
    getEPBBalance()
  }, [user?.addr])

  const preparePacks = async () => {
    let packNumberArray: any[] = []

    for (let element in packs) {
      const id = packs[element].id
      packNumberArray.push(id)
    }
    try {
      const res = await send([
        transaction(PREPARE_PACKS),
        args([
          arg(packNumberArray, t.Array(t.UInt64)),
          arg(parseInt(beastTemplateID), t.UInt32),
        ]),
        payer(authz),
        proposer(authz),
        authorizations([authz]),
        limit(9999),
      ]).then(decode)
      await tx(res).onceSealed()
    } catch (err) {
      console.log(err)
    }
  }

  const unpack = async () => {
    try {
      const res = await send([
        transaction(UNPACK),
        args([arg(parseInt(packID), t.UInt64), arg(user?.addr, t.Address)]),
        payer(authz),
        proposer(authz),
        authorizations([authz]),
        limit(9999),
      ]).then(decode)
      await tx(res).onceSealed()
      getAdminBeastCollection()
      getSushiBalance()
      getPoopBalance()
      getEPBBalance()
    } catch (err) {
      console.log(err)
    }
  }

  const getAdminBeastCollection = async () => {
    try {
      const response = await fcl
        .send([
          fcl.script(GET_BEAST_COLLECTION),
          fcl.args([fcl.arg("0xf8d6e0586b0a20c7", t.Address)]),
        ])
        .then(fcl.decode)
      setAdminCollection(response)
    } catch (err) {
      console.log(err)
    }
  }

  const getPoopBalance = async () => {
    try {
      let response = await query({
        cadence: GET_POOP_BALANCE,
        args: (arg: any, t: any) => [arg(user?.addr, t.Address)],
      })
      setPoopBalance(response)
    } catch (err) {
      console.log(err)
    }
  }

  const getSushiBalance = async () => {
    try {
      let response = await query({
        cadence: GET_SUSHI_BALANCE,
        args: (arg: any, t: any) => [arg(user?.addr, t.Address)],
      })
      setSushiBalance(response)
    } catch (err) {
      console.log(err)
    }
  }

  const getEPBBalance = async () => {
    try {
      let response = await query({
        cadence: GET_EMPTY_POTION_BOTTLE_BALANCE,
        args: (arg: any, t: any) => [arg(user?.addr, t.Address)],
      })
      setEPBBalance(response)
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <TestSectionStyles>
      <TestSection id={id} title={title}>
        <ActionItem>
          <FuncArgInput
            placeholder="beastTemplateID"
            type="text"
            onChange={(e: any) => setBeastTemplateID(e.target.value)}
          />
          <FuncArgButton
            onClick={() => {
              preparePacks()
            }}
          >
            Prepare Packs
          </FuncArgButton>
        </ActionItem>
        <ActionItem>
          <FuncArgInput
            placeholder="packID"
            type="text"
            onChange={(e: any) => setPackID(e.target.value)}
          />
          <FuncArgButton
            onClick={() => {
              unpack()
            }}
          >
            Unpack
          </FuncArgButton>
        </ActionItem>
        {sushiBalance ? (
          <div>Sushi Balance: {parseFloat(sushiBalance).toFixed(2)}</div>
        ) : (
          <></>
        )}
        {poopBalance ? (
          <div>Poop Balance: {parseFloat(poopBalance).toFixed(2)}</div>
        ) : (
          <></>
        )}
        {epbBalance ? (
          <div>EPB Balance: {parseFloat(epbBalance).toFixed(2)}</div>
        ) : (
          <></>
        )}
        <div>
          <h3>Admin Collection</h3>
          <pre>{JSON.stringify(adminCollection, null, 2)}</pre>
        </div>
      </TestSection>
    </TestSectionStyles>
  )
}

export default PackInteractions
