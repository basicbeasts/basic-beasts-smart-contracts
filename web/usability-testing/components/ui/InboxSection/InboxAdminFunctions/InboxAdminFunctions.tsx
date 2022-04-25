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

const InboxAdminFunctions: FC<Props> = ({ id, title }) => {
  useEffect(() => {}, [])

  const createPackMail = async () => {
    let mails = []
    mails.push({ key: "0x179b6b1cb6755e31", value: [4, 5, 6] })
    try {
      const res = await send([
        transaction(CREATE_PACK_MAIL),
        args([
          arg(
            mails,
            t.Dictionary({ key: t.Address, value: t.Array(t.UInt64) }),
          ),
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
        <h3>create pack mail</h3>
        <FuncButton onClick={() => createPackMail()}>
          createPackMail()
        </FuncButton>
        <h3>create mail</h3>
      </TestSection>
    </TestSectionStyles>
  )
}

export default InboxAdminFunctions
