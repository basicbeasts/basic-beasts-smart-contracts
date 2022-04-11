import { FC, useEffect, useState } from "react"
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
import TestSection, { TestSectionStyles } from "@components/ui/TestSection"
import { FuncArgButton, FuncArgInput } from "@components/ui/FuncArgButton"
import BeastTemplate from "utils/BeastTemplate"
import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
import styled from "styled-components"
import BeastCard from "@components/ui/BeastCard"
import FuncButton from "@components/ui/FuncButton"
import { GET_BEAST_TEMPLATE } from "@cadence/scripts/BasicBeasts/script.get-beast-template"
import { GET_NUM_MINTED_PER_BEAST_TEMPLATE } from "@cadence/scripts/BasicBeasts/script.get-num-minted-per-beast-template"
import { IS_BEAST_RETIRED } from "@cadence/scripts/BasicBeasts/script.is-beast-retired"
import { MINT_BEAST } from "@cadence/transactions/BasicBeasts/admin/transaction.mint-beast"
import { RETIRE_BEAST } from "@cadence/transactions/BasicBeasts/admin/transaction.retire-beast"
import { BATCH_MINT_BEAST } from "@cadence/transactions/BasicBeasts/admin/transaction.batch-mint-beast"

const TestWrapper = styled.div`
  display: flex;
  width: 100%;
  margin-top: 20px;
`

const Column = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  width: 60%;
  flex-direction: row;
`

const ColumnText = styled.div`
  margin-left: 1em;
  line-height: 2em;
`

const ActionItem = styled.div`
  padding: 10px 0;
`

type Props = {
  id: any
  title: String
}

const MintBeast: FC<Props> = ({ id, title }) => {
  const [beastTemplateID, setBeastTemplateID] = useState<any | undefined>()
  const [beastTemplate, setBeastTemplate] = useState<BeastTemplate | null>()
  const [numberMinted, setNumberMinted] = useState(null)
  const [retired, setRetired] = useState<Boolean | null>()
  const [quantity, setQuantity] = useState<any | undefined>()

  useEffect(() => {}, [])
  // Running a Script
  const getBeastTemplate = async () => {
    setBeastTemplate(null)
    const response = await fcl
      .send([
        fcl.script(GET_BEAST_TEMPLATE),
        fcl.args([fcl.arg(parseInt(beastTemplateID), t.UInt32)]),
      ])
      .then(fcl.decode)

    setBeastTemplate(response)
  }

  const getNumberMintedPerBeastTemplate = async () => {
    setNumberMinted(null)
    const response = await fcl
      .send([
        fcl.script(GET_NUM_MINTED_PER_BEAST_TEMPLATE),
        fcl.args([fcl.arg(parseInt(beastTemplateID), t.UInt32)]),
      ])
      .then(fcl.decode)

    setNumberMinted(response)
  }

  const isBeastRetired = async () => {
    setRetired(null)
    const response = await fcl
      .send([
        fcl.script(IS_BEAST_RETIRED),
        fcl.args([fcl.arg(parseInt(beastTemplateID), t.UInt32)]),
      ])
      .then(fcl.decode)
    setRetired(response)
  }

  // Transaction
  const mintBeast = async () => {
    try {
      const res = await send([
        transaction(MINT_BEAST),
        args([arg(parseInt(beastTemplateID), t.UInt32)]),
        payer(authz),
        proposer(authz),
        authorizations([authz]),
        limit(9999),
      ]).then(decode)
      await tx(res).onceSealed()
      getNumberMintedPerBeastTemplate()
    } catch (err) {
      console.log(err)
    }
  }

  // Transaction
  const retireBeast = async () => {
    try {
      const res = await send([
        transaction(RETIRE_BEAST),
        args([arg(parseInt(beastTemplateID), t.UInt32)]),
        payer(authz),
        proposer(authz),
        authorizations([authz]),
        limit(9999),
      ]).then(decode)
      await tx(res).onceSealed()
      isBeastRetired()
    } catch (err) {
      console.log(err)
    }
  }

  const batchMintBeast = async () => {
    try {
      const res = await send([
        transaction(BATCH_MINT_BEAST),
        args([
          arg(parseInt(beastTemplateID), t.UInt32),
          arg(parseInt(quantity), t.UInt32),
        ]),
        payer(authz),
        proposer(authz),
        authorizations([authz]),
        limit(9999),
      ]).then(decode)
      await tx(res).onceSealed()
      getNumberMintedPerBeastTemplate()
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <TestSectionStyles>
      <TestSection id={id} title={title}>
        <TestWrapper>
          <div>
            <ActionItem>
              <FuncArgInput
                placeholder="beastTemplateID"
                type="text"
                onChange={(e: any) => setBeastTemplateID(e.target.value)}
              />
              <FuncArgButton
                onClick={() => {
                  getBeastTemplate()
                  getNumberMintedPerBeastTemplate()
                  isBeastRetired()
                }}
              >
                getBeastTemplate(UInt32)
              </FuncArgButton>
            </ActionItem>
            <ActionItem>
              <FuncButton onClick={() => mintBeast()}>
                adminRef.mintBeast(beastTemplateID)
              </FuncButton>
            </ActionItem>
            <ActionItem>
              <FuncArgInput
                placeholder="quantity"
                type="text"
                onChange={(e: any) => setQuantity(e.target.value)}
              />
              <FuncArgButton onClick={() => batchMintBeast()}>
                Batch Mint
              </FuncArgButton>
            </ActionItem>
            <ActionItem>
              <FuncButton onClick={() => retireBeast()}>
                adminRef.retireBeast(beastTemplateID)
              </FuncButton>
            </ActionItem>
          </div>
          <br />
          <br />
          {beastTemplate != null ? (
            <Column>
              <div>
                <ColumnText>
                  <div>beastTemplateID: {beastTemplate.beastTemplateID}</div>

                  <div>numberMintedPerBeastTemplate: {numberMinted}</div>
                  <div>
                    retired: {retired != null ? <>{String(retired)}</> : <></>}
                  </div>
                </ColumnText>
                <BeastCard beastTemplate={beastTemplate} />
              </div>
            </Column>
          ) : (
            <Column>No Beast Template found on-chain</Column>
          )}
        </TestWrapper>
      </TestSection>
    </TestSectionStyles>
  )
}

export default MintBeast
