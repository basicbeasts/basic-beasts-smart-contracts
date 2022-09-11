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
import Dropdown from "react-dropdown"
import "react-dropdown/style.css"
import batch from "data/batch_1"
import { MINT_AND_PREPARE_PACKS } from "@cadence/transactions/Pack/admin/transaction.mint-and-prepare-packs"
import { authorizationFunction } from "authorization"
import { UNPACK_TEN } from "@cadence/transactions/Pack/pack/transaction.unpackTen"

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

  const [batchNumbers, setBatchNumbers] = useState<string[] | null>([
    "1",
    "2",
    "3",
  ])

  const [batchNumber, setBatchNumber] = useState()

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

  const getBatchNumbers = async () => {
    setBatchNumbers(null)
    try {
      var mappedBatchNumbers: any[] = []

      // for each batch number
      // check if first stocknumber in batch has been minted
      // if not minted. add batch number into array

      setBatchNumbers(mappedBatchNumbers)
    } catch (err) {
      console.log(err)
    }
  }

  const mintPreparePacks = async () => {
    let packTemplateIDsDic: any[] = []
    let beastTemplateIDsDic: any[] = []

    let stockNumberArray: any[] = []

    for (let element in batch) {
      const stockNumber = batch[element].stockNumber.toString()
      const packTemplateID = batch[element].packTemplateID.toString()
      const beastTemplateID = batch[element].beastTemplateID.toString()

      stockNumberArray.push(stockNumber)
      packTemplateIDsDic.push({ key: stockNumber, value: packTemplateID })
      beastTemplateIDsDic.push({ key: stockNumber, value: beastTemplateID })
    }
    try {
      const res = await send([
        transaction(MINT_AND_PREPARE_PACKS),
        args([
          arg(stockNumberArray, t.Array(t.UInt64)),
          arg(
            packTemplateIDsDic,
            t.Dictionary({ key: t.UInt64, value: t.UInt32 }),
          ),
          arg(
            beastTemplateIDsDic,
            t.Dictionary({ key: t.UInt64, value: t.UInt32 }),
          ),
        ]),
        payer(authorizationFunction),
        proposer(authorizationFunction),
        authorizations([authorizationFunction]),
        limit(999999),
      ]).then(decode)
      await tx(res).onceSealed()
    } catch (err) {
      console.log(err)
    }
  }

  const unpackTen = async () => {
    try {
      const res = await send([
        transaction(UNPACK_TEN),
        args([
          arg(
            [
              "202",
              "203",
              "204",
              "205",
              "206",
              "207",
              "208",
              "209",
              "210",
              "211",
              "212",
              "213",
              "214",
              "215",
              "216",
              "217",
              "218",
              "219",
              "220",
              "221",
            ],
            t.Array(t.UInt64),
          ),
          arg(user?.addr, t.Address),
        ]),
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
        <ActionItem>
          <FuncButton onClick={() => unpackTen()}>
            Unpack up to 10 packs
          </FuncButton>
        </ActionItem>
        <h3>Mint and Prepare Packs</h3>
        {batchNumbers != null ? (
          <ActionItem>
            <div>
              <div>Number of packs to prepare in batch: {batch.length}</div>
              <FuncButton
                onClick={() => {
                  mintPreparePacks()
                }}
              >
                Mint and Prepare Packs
              </FuncButton>
            </div>
            {}
          </ActionItem>
        ) : (
          <></>
        )}
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
