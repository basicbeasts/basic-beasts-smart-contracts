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

const ActionItem = styled.div`
  padding: 10px 0;
`

type Props = {
  id: any
  title: String
  user: any
}

const AdminEvolveBeasts: FC<Props> = ({ id, title, user }) => {
  const [beastIDs, setBeastIDs] = useState<string[] | null>()
  const [ID1, setID1] = useState<any>()
  const [ID2, setID2] = useState<any>()
  const [ID3, setID3] = useState<any>()

  useEffect(() => {
    getBeastIDs()
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

  const evolveBeast = async () => {
    try {
      const res = await send([
        transaction(EVOLVE_BEAST),
        args([
          arg(parseInt(ID1), t.UInt64),
          arg(parseInt(ID2), t.UInt64),
          arg(parseInt(ID3), t.UInt64),
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

  return (
    <TestSectionStyles>
      <TestSection id={id} title={title}>
        <FuncArgInput
          placeholder="ID 1"
          type="text"
          onChange={(e: any) => setID1(e.target.value)}
        />
        <FuncArgInput
          placeholder="ID 2"
          type="text"
          onChange={(e: any) => setID2(e.target.value)}
        />
        <FuncArgInput
          placeholder="ID 3"
          type="text"
          onChange={(e: any) => setID3(e.target.value)}
        />
        <ActionItem>
          <FuncButton onClick={() => getBeastIDs()}>getBeastIDs()</FuncButton>
        </ActionItem>
        <pre>{JSON.stringify(beastIDs, null, 2)}</pre>
        <ActionItem>
          <FuncButton onClick={() => evolveBeast()}>evolveBeast()</FuncButton>
        </ActionItem>
      </TestSection>
    </TestSectionStyles>
  )
}

export default AdminEvolveBeasts
