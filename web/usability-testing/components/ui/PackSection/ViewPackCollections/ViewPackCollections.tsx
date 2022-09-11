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
import { GET_PACK_COLLECTION } from "@cadence/scripts/Pack/script.get-pack-collection"

const ActionItem = styled.div`
  padding: 10px 0;
`

const TextAlert = styled.div`
  margin: 20px 0;
`

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
}

const ViewPackCollections: FC<Props> = ({ id, title }) => {
  const [adminCollection, setAdminCollection] = useState<any>()
  const [accountACollection, setAccountACollection] = useState<any>()
  const [isCopied, setIsCopied] = useState(false)

  const getAdminPackCollection = async () => {
    try {
      const response = await fcl
        .send([
          fcl.script(GET_PACK_COLLECTION),
          fcl.args([fcl.arg("0xf8d6e0586b0a20c7", t.Address)]),
        ])
        .then(fcl.decode)
      setAdminCollection(response)
    } catch (err) {
      console.log(err)
    }
  }

  const getAccountAPackCollection = async () => {
    try {
      const response = await fcl
        .send([
          fcl.script(GET_PACK_COLLECTION),
          fcl.args([fcl.arg("0x179b6b1cb6755e31", t.Address)]),
        ])
        .then(fcl.decode)
      setAccountACollection(response)
    } catch (err) {
      console.log(err)
    }
  }

  function handleClick() {
    navigator.clipboard.writeText(JSON.stringify(adminCollection, null, 2))
    setIsCopied(true)
  }

  return (
    <TestSectionStyles>
      <TestSection id={id} title={title}>
        <FuncButton
          onClick={() => {
            getAdminPackCollection()
            getAccountAPackCollection()
          }}
        >
          Fetch Collections
        </FuncButton>
        <ActionItem>
          {adminCollection != null ? (
            <FuncButton onClick={handleClick}>
              {isCopied
                ? "Copied to clipboard"
                : "Copy admin collection to clipboard"}
            </FuncButton>
          ) : (
            ""
          )}
        </ActionItem>
        <TestWrapper>
          <div>
            <h3>Admin Collection</h3>
            <div>
              Admin Pack Collection length:{" "}
              {adminCollection != null ? adminCollection.length : ""}
            </div>
            {/* <pre>{JSON.stringify(adminCollection, null, 2)}</pre> */}
          </div>
          <Column>
            <div>
              <h3>Account A Collection</h3>
              <div>
                Account A Pack Collection length:{" "}
                {accountACollection != null ? accountACollection.length : ""}
              </div>
              {/* <pre>{JSON.stringify(accountACollection, null, 2)}</pre> */}
            </div>
          </Column>
        </TestWrapper>
      </TestSection>
    </TestSectionStyles>
  )
}

export default ViewPackCollections
