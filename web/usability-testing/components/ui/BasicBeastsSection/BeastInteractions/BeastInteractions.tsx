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

const TestWrapper = styled.div`
  display: flex;
  width: 100%;
`

const Column = styled.div`
  justify-content: center;
  align-items: center;
  width: 60%;
`

const ActionItem = styled.div`
  padding: 10px 0;
`

type Props = {
  id: any
  title: String
  user: any
}

const BeastInteractions: FC<Props> = ({ id, title, user }) => {
  useEffect(() => {}, [user?.addr])

  return (
    <TestSectionStyles>
      <TestSection id={id} title={title}>
        <TestWrapper>
          <div>Select Beast.id dropdown</div>
          <div>useState for id selected to do any of the four actions</div>
          <Column>
            <ActionItem>
              <FuncButton>transfer beast</FuncButton>
            </ActionItem>
            <ActionItem>
              <FuncButton>change nickname</FuncButton>
            </ActionItem>
            <ActionItem>
              <FuncButton>set first owner</FuncButton>
            </ActionItem>
            <ActionItem>
              <FuncButton>destroy</FuncButton>
            </ActionItem>
          </Column>
        </TestWrapper>
      </TestSection>
    </TestSectionStyles>
  )
}

export default BeastInteractions
