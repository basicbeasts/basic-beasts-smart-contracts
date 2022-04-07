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
import { FuncArgButton, FuncArgInput } from "@components/ui/FuncArgButton"
import { ADMIN_EVOLVE_BEAST } from "@cadence/transactions/Evolution/admin/transaction.admin-evolve-beast"
import { ADMIN_REVEAL_BEAST } from "@cadence/transactions/Evolution/admin/transaction.admin-reveal-beast"

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
  const [isMythic, setIsMythic] = useState(false)

  const [evolvedBeastID, setEvolvedBeastID] = useState<any>()

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

  const adminEvolveBeast = async () => {
    try {
      const res = await send([
        transaction(ADMIN_EVOLVE_BEAST),
        args([
          arg(parseInt(ID1), t.UInt64),
          arg(parseInt(ID2), t.UInt64),
          arg(parseInt(ID3), t.UInt64),
          arg(isMythic, t.Bool),
          arg("0xf8d6e0586b0a20c7", t.Address),
        ]),
        payer(authz),
        proposer(authz),
        authorizations([authz]),
        limit(9999),
      ]).then(decode)
      await tx(res).onceSealed()
      getBeastIDs()
    } catch (err) {
      console.log(err)
    }
  }

  const adminRevealBeast = async () => {
    try {
      const res = await send([
        transaction(ADMIN_REVEAL_BEAST),
        args([
          arg(parseInt(evolvedBeastID), t.UInt64),
          arg("0xf8d6e0586b0a20c7", t.Address),
        ]),
        payer(authz),
        proposer(authz),
        authorizations([authz]),
        limit(9999),
      ]).then(decode)
      await tx(res).onceSealed()
      getBeastIDs()
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <TestSectionStyles>
      <TestSection id={id} title={title}>
        <div>
          Note: Functions such as admin.evolveBeast() and admin.revealBeast()
          are supposed to be done through a backend. But the user has to propose
          transactions for it. But the admin does not have access to the user's
          collection so either we should have a contract where the user can
          allow the admin to fetch the beasts to evolve or link a capability to
          withdraw for the admin. For now these functions can only be tested by
          the admin account using the admin's collection. To ensure that the
          functions themselves work as intended.
        </div>
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
          <FuncButton onClick={() => adminEvolveBeast()}>
            admin.evolveBeast()
          </FuncButton>
        </ActionItem>
        <h3>Reveal if evolved beast is mythic</h3>
        <ActionItem>
          <FuncArgInput
            placeholder="evolved beast id"
            type="text"
            onChange={(e: any) => setEvolvedBeastID(e.target.value)}
          />
          <FuncArgButton onClick={() => adminRevealBeast()}>
            admin.revealBeast()
          </FuncArgButton>
        </ActionItem>
      </TestSection>
    </TestSectionStyles>
  )
}

export default AdminEvolveBeasts
