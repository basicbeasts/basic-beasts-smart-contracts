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
import { GET_BEAST_IDS } from "@cadence/scripts/BasicBeasts/script.get-beast-ids"
import { FuncArgInput } from "@components/ui/FuncArgButton"
import { EVOLVE_BEAST } from "@cadence/transactions/Evolution/transaction.evolve-beast"
import { GET_ALL_NUM_EVOLVED_PER_BEAST_TEMPLATE } from "@cadence/scripts/Evolution/script.get-all-num-evolved-per-beast-template"
import { PUBLIC_BREED } from "@cadence/transactions/Breeding/transaction.public-breed"
import { GET_EGGS } from "@cadence/scripts/Egg/script.get-eggs"
import { GET_ALL_BREEDING_COUNTS } from "@cadence/scripts/Breeding/script.get-all-breeding-counts"
import ReactDropdown from "react-dropdown"
import { GET_EGG_IDS } from "@cadence/scripts/Egg/script.get-egg-ids"
import { GET_EGG } from "@cadence/scripts/Egg/script.get-egg"
import { INCUBATE } from "@cadence/transactions/Egg/transaction.incubate"
import { HATCH } from "@cadence/transactions/Egg/transaction.hatch"

const ActionItem = styled.div`
  padding: 10px 0;
`

type Props = {
  id: any
  title: String
  user: any
}

const ManageEggs: FC<Props> = ({ id, title, user }) => {
  const [beastIDs, setBeastIDs] = useState<string[] | null>()
  const [eggIDs, setEggIDs] = useState<any>()
  const [eggID, setEggID] = useState<any>()
  const [egg, setEgg] = useState<any>()
  const [ID1, setID1] = useState<any>()
  const [ID2, setID2] = useState<any>()
  const [eggs, setEggs] = useState<any>()
  const [breedingCounts, setBreedingCounts] = useState<any>()
  const [allNumEvolvedPerBeastTemplate, setAllNumEvolvedPerBeastTemplate] =
    useState<any>()

  useEffect(() => {
    getBeastIDs()
    getEggs()
    getAllBreedingCounts()
    getEggIDs()
  }, [user?.addr])

  const getBeastIDs = async () => {
    setBeastIDs(null)
    try {
      const response = await fcl
        .send([
          fcl.script(GET_BEAST_IDS),
          fcl.args([fcl.arg(user?.addr, t.Address)]),
        ])
        .then(fcl.decode)

      setBeastIDs(response)
    } catch (err) {
      console.log(err)
    }
  }

  const publicBreed = async () => {
    try {
      const res = await send([
        transaction(PUBLIC_BREED),
        args([arg(parseInt(ID1), t.UInt64), arg(parseInt(ID2), t.UInt64)]),
        payer(authz),
        proposer(authz),
        authorizations([authz]),
        limit(9999),
      ]).then(decode)
      await tx(res).onceSealed()
      getEggs()
      getAllBreedingCounts()
    } catch (err) {
      console.log(err)
    }
  }

  const getEggs = async () => {
    try {
      let response = await query({
        cadence: GET_EGGS,
        args: (arg: any, t: any) => [arg(user?.addr, t.Address)],
      })
      setEggs(response)
      console.log("eggs", response)
    } catch (err) {
      console.log(err)
    }
  }

  const getEggIDs = async () => {
    try {
      let response = await query({
        cadence: GET_EGG_IDS,
        args: (arg: any, t: any) => [arg(user?.addr, t.Address)],
      })
      setEggIDs(response)
    } catch (err) {
      console.log(err)
    }
  }

  const getAllBreedingCounts = async () => {
    try {
      let response = await query({
        cadence: GET_ALL_BREEDING_COUNTS,
      })
      setBreedingCounts(response)
      console.log("eggs", response)
    } catch (err) {
      console.log(err)
    }
  }

  const getEgg = async () => {
    try {
      let response = await query({
        cadence: GET_EGG,
        args: (arg: any, t: any) => [
          arg(user?.addr, t.Address),
          arg(eggID, t.UInt64),
        ],
      })
      setEgg(response)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    getEgg()
  }, [eggID, user?.addr])

  const incubate = async () => {
    try {
      const res = await send([
        transaction(INCUBATE),
        args([arg(eggID, t.UInt64)]),
        payer(authz),
        proposer(authz),
        authorizations([authz]),
        limit(9999),
      ]).then(decode)
      await tx(res).onceSealed()
      getEggs()
      getAllBreedingCounts()
      getEgg()
    } catch (err) {
      console.log(err)
    }
  }

  const hatch = async () => {
    try {
      const res = await send([
        transaction(HATCH),
        args([arg(eggID, t.UInt64)]),
        payer(authz),
        proposer(authz),
        authorizations([authz]),
        limit(9999),
      ]).then(decode)
      await tx(res).onceSealed()
      getEggs()
      getAllBreedingCounts()
      getEgg()
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <TestSectionStyles>
      <TestSection id={id} title={title}>
        {eggIDs != null && (
          <ReactDropdown
            options={eggIDs}
            onChange={(e) => {
              setEggID(e.value)
            }}
            placeholder={"Choose egg id"}
          />
        )}
        <pre>{JSON.stringify(egg, null, 2)}</pre>
        <h3>Image:</h3>
        <img
          style={{ width: "100px" }}
          src={"https://" + egg?.image + ".ipfs.nftstorage.link"}
        />
        <h3>Incubate: </h3>
        <ActionItem>
          <FuncButton onClick={() => incubate()}>incubate()</FuncButton>
        </ActionItem>
        <h3>Hatch</h3>
        <ActionItem>
          <FuncButton onClick={() => hatch()}>hatch()</FuncButton>
        </ActionItem>
        <h3>egg balance: {eggs?.length}</h3>
        <h3>All egg images</h3>
        <h3>All egg incubators</h3>
        <h3>All egg shells</h3>
      </TestSection>
    </TestSectionStyles>
  )
}

export default ManageEggs
