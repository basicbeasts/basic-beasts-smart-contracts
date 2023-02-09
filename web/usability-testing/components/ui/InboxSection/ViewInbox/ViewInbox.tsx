import { FC, useEffect, useState } from "react"
import TestSection, { TestSectionStyles } from "@components/ui/TestSection"
import styled from "styled-components"
import FuncButton from "@components/ui/FuncButton"
import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
import { GET_WALLET_MAILS } from "@cadence/scripts/Inbox/script.get-wallet-mails"
import { CLAIM_ALL_MAIL } from "@cadence/transactions/Inbox/transaction.claim-all-mail"
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
import { GET_MAILS_LENGTH } from "@cadence/scripts/Inbox/script.get-mails-length"
import { CLAIM_SOME_MAILS } from "@cadence/transactions/Inbox/transaction.claim-some-mails"
import { GET_ADDRESSES } from "@cadence/scripts/Inbox/script.get-addresses"

const ActionItem = styled.div`
  padding: 10px 0;
`

const TestWrapper = styled.div`
  display: flex;
  width: 100%;
`
const Column = styled.div`
  justify-content: center;
  display: flex;
  flex-direction: column;
  margin-left: 50px;
`

type Props = {
  id: any
  title: String
}

const ViewInbox: FC<Props> = ({ id, title }) => {
  const [adminCollection, setAdminCollection] = useState<any>()
  const [accountACollection, setAccountACollection] = useState()
  const [isCopied, setIsCopied] = useState(false)
  const [mailsLength, setMailsLength] = useState()
  const [addresses, setAddresses] = useState()

  const quantity = "500"

  const getAdminInbox = async () => {
    try {
      const response = await fcl
        .send([
          fcl.script(GET_WALLET_MAILS),
          fcl.args([
            fcl.arg("0xf8d6e0586b0a20c7", t.Address),
            fcl.arg("0xf8d6e0586b0a20c7", t.Address),
          ]),
        ])
        .then(fcl.decode)
      setAdminCollection(response)
    } catch (err) {
      console.log(err)
    }
  }

  const getAccountAInbox = async () => {
    try {
      const response = await fcl
        .send([
          fcl.script(GET_WALLET_MAILS),
          fcl.args([
            fcl.arg("0xf8d6e0586b0a20c7", t.Address),
            fcl.arg("0x045a1763c93006ca", t.Address),
          ]),
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

  const claimAllMails = async () => {
    try {
      const res = await send([
        transaction(CLAIM_ALL_MAIL),
        args([arg("0xf8d6e0586b0a20c7", t.Address)]),
        payer(authz),
        proposer(authz),
        authorizations([authz]),
        limit(9999),
      ]).then(decode)
      await tx(res).onceSealed()

      getAdminInbox()
      getAccountAInbox()
      getMailsLength()
    } catch (err) {
      console.log(err)
    }
  }

  const getMailsLength = async () => {
    try {
      const response = await fcl
        .send([
          fcl.script(GET_MAILS_LENGTH),
          fcl.args([fcl.arg("0xf8d6e0586b0a20c7", t.Address)]),
        ])
        .then(fcl.decode)
      setMailsLength(response)
    } catch (err) {
      console.log(err)
    }
  }

  const getAddresses = async () => {
    try {
      const response = await fcl
        .send([
          fcl.script(GET_ADDRESSES),
          fcl.args([fcl.arg("0xf8d6e0586b0a20c7", t.Address)]),
        ])
        .then(fcl.decode)
      setAddresses(response)
    } catch (err) {
      console.log(err)
    }
  }

  const claimSomeMails = async () => {
    try {
      const res = await send([
        transaction(CLAIM_SOME_MAILS),
        args([arg("0xf8d6e0586b0a20c7", t.Address), arg(quantity, t.Int)]),
        payer(authz),
        proposer(authz),
        authorizations([authz]),
        limit(9999),
      ]).then(decode)
      await tx(res).onceSealed()
      console.log("Test succeeded: Claiming " + quantity + " mails")

      getAdminInbox()
      getAccountAInbox()
      getMailsLength()
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {}, [])

  return (
    <TestSectionStyles>
      <TestSection id={id} title={title}>
        <FuncButton
          onClick={() => {
            getAdminInbox()
            getAccountAInbox()
            getMailsLength()
            getAddresses()
          }}
        >
          Fetch Inboxes
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
            <h3>Admin Inbox</h3>

            <div>
              Admin Inbox length:{" "}
              {adminCollection != null ? adminCollection.length : ""}
            </div>
            <pre>{JSON.stringify(adminCollection, null, 2)}</pre>
          </div>
          <Column>
            <div>
              <h3>Account A Inbox</h3>
              <pre>{JSON.stringify(accountACollection, null, 2)}</pre>
            </div>
          </Column>
        </TestWrapper>
        <FuncButton onClick={() => claimAllMails()}>
          Claim All Mails (Outdated)
        </FuncButton>
        <div />
        <FuncButton onClick={() => claimSomeMails()}>
          Claim Up to {quantity} Mails
        </FuncButton>

        <div>
          <h3>Mails Length</h3>
          <pre>{JSON.stringify(mailsLength, null, 2)}</pre>
        </div>
        <div>
          <h3>Addresses in Inbox</h3>
          <pre>{JSON.stringify(addresses, null, 2)}</pre>
        </div>
      </TestSection>
    </TestSectionStyles>
  )
}

export default ViewInbox
