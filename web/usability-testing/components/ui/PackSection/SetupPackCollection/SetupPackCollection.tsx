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
import { SETUP_PACK_COLLECTION } from "@cadence/transactions/Pack/transaction.setup-collection"
import { IS_PACK_COLLECTION_INITIALIZED } from "@cadence/scripts/Pack/script.is-pack-collection-initialized"

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

const SetupPackCollection: FC<Props> = ({ id, title, user }) => {
  const [collectionInitialized, setCollectionInitialized] = useState()

  useEffect(() => {
    isCollectionInitialized()
  }, [user?.addr])

  const setupCollection = async () => {
    try {
      const res = await send([
        transaction(SETUP_PACK_COLLECTION),
        payer(authz),
        proposer(authz),
        authorizations([authz]),
        limit(9999),
      ]).then(decode)
      await tx(res).onceSealed()
      isCollectionInitialized()
    } catch (err) {
      console.log(err)
    }
  }

  const isCollectionInitialized = async () => {
    try {
      let response = await query({
        cadence: IS_PACK_COLLECTION_INITIALIZED,
        args: (arg: any, t: any) => [arg(user?.addr, t.Address)],
      })
      setCollectionInitialized(response)
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <TestSectionStyles>
      <TestSection id={id} title={title}>
        <h3>Setup Pack Collection</h3>
        <FuncButton onClick={() => setupCollection()}>
          createEmptyCollection()
        </FuncButton>
        {collectionInitialized ? (
          <TextAlert className="green-text">
            Pack collection is initialized
          </TextAlert>
        ) : (
          <>
            <TextAlert className="red-text">
              Pack collection is not initialized
            </TextAlert>
          </>
        )}
      </TestSection>
    </TestSectionStyles>
  )
}

export default SetupPackCollection
