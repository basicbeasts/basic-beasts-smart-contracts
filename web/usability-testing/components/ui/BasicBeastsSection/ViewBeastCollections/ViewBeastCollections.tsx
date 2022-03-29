import { FC, useEffect, useState } from "react"
import TestSection, { TestSectionStyles } from "@components/ui/TestSection"
import FuncButton from "@components/ui/FuncButton"
import { GET_BEAST_COLLECTION } from "@cadence/scripts/BasicBeasts/script.get-beast-collection"
import {
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
import styled from "styled-components"

const TestWrapper = styled.div`
  display: flex;
  width: 100%;
`

const Column = styled.div`
  justify-content: center;
  display: flex;
  width: 60%;
  flex-direction: row;
`

type Props = {
  id: any
  title: String
  user: any
}

const ViewBeastCollections: FC<Props> = ({ id, title, user }) => {
  const [adminCollection, setAdminCollection] = useState()
  const [accountACollection, setAccountACollection] = useState()
  const [collection, setCollection] = useState()

  useEffect(() => {}, [user?.addr])

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

  const getAccountABeastCollection = async () => {
    try {
      const response = await fcl
        .send([
          fcl.script(GET_BEAST_COLLECTION),
          fcl.args([fcl.arg("0x179b6b1cb6755e31", t.Address)]),
        ])
        .then(fcl.decode)
      setAccountACollection(response)
    } catch (err) {
      console.log(err)
    }
  }

  const getBeastCollection = async () => {
    const response = await fcl
      .send([
        fcl.script(GET_BEAST_COLLECTION),
        fcl.args([fcl.arg(user?.addr, t.Address)]),
      ])
      .then(fcl.decode)
    setCollection(response)
  }

  return (
    <TestSectionStyles>
      <TestSection id={id} title={title}>
        <FuncButton
          onClick={() => {
            getAccountABeastCollection()
            getAdminBeastCollection()
          }}
        >
          Fetch Collections
        </FuncButton>
        <TestWrapper>
          <div>
            <h3>Admin Collection</h3>
            <pre>{JSON.stringify(adminCollection, null, 2)}</pre>
          </div>
          <Column>
            <div>
              <h3>Account A Collection</h3>
              <pre>{JSON.stringify(accountACollection, null, 2)}</pre>
            </div>
          </Column>
        </TestWrapper>
      </TestSection>
    </TestSectionStyles>
  )
}

export default ViewBeastCollections
