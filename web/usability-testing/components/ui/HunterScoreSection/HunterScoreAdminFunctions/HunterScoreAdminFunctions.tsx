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
import { FuncArgButton, FuncArgInput } from "@components/ui/FuncArgButton"
import ReactDropdown from "react-dropdown"
import { DEDUCT_POINTS } from "@cadence/transactions/HunterScore/admin/transaction.deduct-points"
import { BAN_ADDRESS } from "@cadence/transactions/HunterScore/admin/transaction.ban-address"
import { UNBAN_ADDRESS } from "@cadence/transactions/HunterScore/admin/transaction.unban-address"
import { GET_ALL_BANNED } from "@cadence/scripts/HunterScore/script.get-all-banned"

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
}

const HunterScoreAdminFunctions: FC<Props> = ({ id, title }) => {
  const [selectedAddress, setSelectedAddress] =
    useState<string>("0xf8d6e0586b0a20c7")

  const [pointsToDeduct, setPointsToDeduct] = useState<number>()

  const [banned, setBanned] = useState()

  useEffect(() => {
    getAllBanned()
  }, [])

  const deductPoints = async () => {
    try {
      const res = await send([
        transaction(DEDUCT_POINTS),
        args([
          arg(selectedAddress, t.Address),
          arg(parseInt(pointsToDeduct), t.UInt32),
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

  const banAddress = async () => {
    try {
      const res = await send([
        transaction(BAN_ADDRESS),
        args([arg(selectedAddress, t.Address)]),
        payer(authz),
        proposer(authz),
        authorizations([authz]),
        limit(9999),
      ]).then(decode)
      await tx(res).onceSealed()
      getAllBanned()
    } catch (err) {
      console.log(err)
    }
  }

  const unbanAddress = async () => {
    try {
      const res = await send([
        transaction(UNBAN_ADDRESS),
        args([arg(selectedAddress, t.Address)]),
        payer(authz),
        proposer(authz),
        authorizations([authz]),
        limit(9999),
      ]).then(decode)
      await tx(res).onceSealed()
      getAllBanned()
    } catch (err) {
      console.log(err)
    }
  }

  const getAllBanned = async () => {
    try {
      const response = await fcl
        .send([fcl.script(GET_ALL_BANNED)])
        .then(fcl.decode)

      setBanned(response)
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <TestSectionStyles>
      <TestSection id={id} title={title}>
        <Column>
          <h3>Select Address: </h3>
          <ReactDropdown
            options={["0xf8d6e0586b0a20c7", "0x179b6b1cb6755e31"]}
            onChange={(e) => {
              setSelectedAddress(e.value)
            }}
            placeholder="0xf8d6e0586b0a20c7"
          />
        </Column>
        <ActionItem>
          <FuncArgInput
            placeholder="Points"
            type="text"
            onChange={(e: any) => setPointsToDeduct(e.target.value)}
          />
          <FuncArgButton onClick={() => deductPoints()}>
            admin.deductPoints()
          </FuncArgButton>
        </ActionItem>
        <ActionItem>
          <FuncButton onClick={() => banAddress()}>
            admin.banAddress()
          </FuncButton>
        </ActionItem>
        <ActionItem>
          <FuncButton onClick={() => unbanAddress()}>
            admin.unbanAddress()
          </FuncButton>
        </ActionItem>
        <h3>getAllBanned()</h3>
        {banned != null ? <pre>{JSON.stringify(banned, null, 2)}</pre> : ""}
      </TestSection>
    </TestSectionStyles>
  )
}

export default HunterScoreAdminFunctions
