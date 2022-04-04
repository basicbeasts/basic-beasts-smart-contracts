import { FC, useEffect, useState } from "react"
import TestSection, { TestSectionStyles } from "@components/ui/TestSection"
import FuncButton from "@components/ui/FuncButton"
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
import Dropdown from "react-dropdown"
import "react-dropdown/style.css"
import { GET_BEAST_IDS } from "@cadence/scripts/BasicBeasts/script.get-beast-ids"
import { BORROW_BEAST } from "@cadence/scripts/BasicBeasts/script.borrow-beast"
import { FuncArgButton, FuncArgInput } from "@components/ui/FuncArgButton"
import { TRANSFER_BEAST } from "@cadence/transactions/BasicBeasts/collection/transaction.transfer-beast"
import { CHANGE_NICKNAME } from "@cadence/transactions/BasicBeasts/beast/transaction.change-nickname"
// import { BORROW_ENTIRE_BEAST } from "@cadence/scripts/BasicBeasts/script.borrow-entire-beast"
import { BORROW_ENTIRE_BEAST } from "@cadence/transactions/BasicBeasts/beast/transaction.borrow-entire-beast"
import { DESTROY_BEAST } from "@cadence/transactions/BasicBeasts/beast/transaction.destroy-beast"
import { SET_FIRST_OWNER } from "@cadence/transactions/BasicBeasts/beast/transaction.set-first-owner"

const TestWrapper = styled.div`
  display: flex;
  width: 100%;
`

const Column = styled.div`
  width: 60%;
  display: flex;
  flex-direction: column;
  margin-left: 30px;
`

const ActionItem = styled.div`
  padding: 10px 0;
`

const DropdownWrapper = styled.div`
  display: flex;
  flex-direction: row;
`

const BeastRef = styled.div`
  width: 250px;
  overflow: hidden;
  overflow-x: scroll;
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    display: none;
  }
`

type Props = {
  id: any
  title: String
  user: any
}

const BeastInteractions: FC<Props> = ({ id, title, user }) => {
  //Frontend data
  const [selectedBeastID, setSelectedBeastID] = useState<number | null>()
  const [recipient, setRecipient] = useState<string | null>()
  const [nickname, setNickname] = useState<string | null>()
  const [firstOwnerAddress, setFirstOwnerAddress] = useState<string | null>()

  //On-chain data - could be moved to a hook
  const [beastIDs, setBeastIDs] = useState<string[] | null>()
  const [beastRef, setBeastRef] = useState<any | null>()

  useEffect(() => {}, [])

  //TODO: Refresh when new beast is minted.
  //TODO: Refresh
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

  const borrowBeastRef = async () => {
    setBeastRef(null)
    try {
      const response = await fcl
        .send([
          fcl.script(BORROW_BEAST),
          fcl.args([
            fcl.arg(user?.addr, t.Address),
            fcl.arg(selectedBeastID, t.UInt64),
          ]),
        ])
        .then(fcl.decode)

      setBeastRef(response)
    } catch (err) {
      console.log(err)
    }
  }

  const transferBeast = async () => {
    try {
      const res = await send([
        transaction(TRANSFER_BEAST),
        args([arg(recipient, t.Address), arg(parseInt(beastRef.id), t.UInt64)]),
        payer(authz),
        proposer(authz),
        authorizations([authz]),
        limit(9999),
      ]).then(decode)
      await tx(res).onceSealed()
      setBeastRef(null)
      getBeastIDs()
    } catch (err) {
      console.log(err)
    }
  }

  const changeNickname = async () => {
    try {
      const res = await send([
        transaction(CHANGE_NICKNAME),
        args([arg(nickname, t.String), arg(parseInt(beastRef.id), t.UInt64)]),
        payer(authz),
        proposer(authz),
        authorizations([authz]),
        limit(9999),
      ]).then(decode)
      await tx(res).onceSealed()
      borrowBeastRef()
    } catch (err) {
      console.log(err)
    }
  }

  const setFirstOwner = async () => {
    try {
      const res = await send([
        transaction(SET_FIRST_OWNER),
        args([
          arg(firstOwnerAddress, t.Address),
          arg(parseInt(beastRef.id), t.UInt64),
        ]),
        payer(authz),
        proposer(authz),
        authorizations([authz]),
        limit(9999),
      ]).then(decode)
      await tx(res).onceSealed()
      borrowBeastRef()
    } catch (err) {
      console.log(err)
    }
  }

  const destroyBeast = async () => {
    try {
      const res = await send([
        transaction(DESTROY_BEAST),
        args([arg(parseInt(beastRef.id), t.UInt64)]),
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
        <ActionItem>
          <FuncButton onClick={() => getBeastIDs()}>getBeastIDs()</FuncButton>
        </ActionItem>
        <TestWrapper>
          {beastIDs != null ? (
            <>
              <div>
                <Dropdown
                  options={beastIDs}
                  onChange={(e) => {
                    setSelectedBeastID(parseInt(e.value))
                  }}
                  // value={beastIDs[0].toString()}
                  placeholder="Select a Beast.id"
                />
                {beastRef != null ? (
                  <BeastRef>
                    <br />
                    <div>Name: {beastRef.beastTemplate.name}</div>

                    <pre>{JSON.stringify(beastRef, null, 2)}</pre>
                  </BeastRef>
                ) : (
                  ""
                )}
              </div>
              <div>
                <FuncArgButton onClick={() => borrowBeastRef()}>
                  borrowBeast(id)
                </FuncArgButton>
              </div>
              {beastRef != null ? (
                <Column>
                  <ActionItem>
                    <DropdownWrapper>
                      <Dropdown
                        options={["0xf8d6e0586b0a20c7", "0x179b6b1cb6755e31"]}
                        onChange={(e) => {
                          setRecipient(e.value)
                        }}
                        value={"0xf8d6e0586b0a20c7"}
                        placeholder="Select recipient"
                      />
                      <FuncArgButton onClick={() => transferBeast()}>
                        transferBeast()
                      </FuncArgButton>
                    </DropdownWrapper>
                  </ActionItem>
                  <ActionItem>
                    <FuncArgInput
                      placeholder="nickname"
                      type="text"
                      onChange={(e: any) => setNickname(e.target.value)}
                    />
                    <FuncArgButton
                      onClick={() => {
                        changeNickname()
                      }}
                    >
                      changeNickname()
                    </FuncArgButton>
                  </ActionItem>
                  <ActionItem>
                    <FuncArgInput
                      placeholder="firstOwner"
                      type="text"
                      onChange={(e: any) =>
                        setFirstOwnerAddress(e.target.value)
                      }
                    />
                    <FuncArgButton
                      onClick={() => {
                        setFirstOwner()
                      }}
                    >
                      setFirstOwner()
                    </FuncArgButton>
                  </ActionItem>
                  <ActionItem>
                    <FuncButton
                      onClick={() => {
                        destroyBeast()
                      }}
                    >
                      destroy
                    </FuncButton>
                  </ActionItem>
                </Column>
              ) : (
                ""
              )}
            </>
          ) : (
            ""
          )}
        </TestWrapper>
      </TestSection>
    </TestSectionStyles>
  )
}

export default BeastInteractions
