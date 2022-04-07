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
import { PAUSE_PUBLIC_EVOLUTION } from "@cadence/transactions/Evolution/admin/transaction.admin-pause-public-evolution"
import { START_PUBLIC_EVOLUTION } from "@cadence/transactions/Evolution/admin/transaction.admin-start-public-evolution"
import { IS_PUBLIC_EVOLUTION_PAUSED } from "@cadence/scripts/Evolution/script.is-public-evolution-paused"

const ActionItem = styled.div`
  padding: 10px 0;
`

type Props = {
  id: any
  title: String
  user: any
}

const OtherEvolutionAdminFunctions: FC<Props> = ({ id, title, user }) => {
  const [publicEvolutionPaused, setPublicEvolutionPaused] = useState<
    Boolean | undefined
  >()

  useEffect(() => {
    isPublicEvolutionPaused()
  }, [user?.addr])

  const pausePublicEvolution = async () => {
    try {
      const res = await send([
        transaction(PAUSE_PUBLIC_EVOLUTION),
        payer(authz),
        proposer(authz),
        authorizations([authz]),
        limit(9999),
      ]).then(decode)
      await tx(res).onceSealed()
      isPublicEvolutionPaused()
    } catch (err) {
      console.log(err)
    }
  }

  const startPublicEvolution = async () => {
    try {
      const res = await send([
        transaction(START_PUBLIC_EVOLUTION),
        payer(authz),
        proposer(authz),
        authorizations([authz]),
        limit(9999),
      ]).then(decode)
      await tx(res).onceSealed()
      isPublicEvolutionPaused()
    } catch (err) {
      console.log(err)
    }
  }

  const isPublicEvolutionPaused = async () => {
    try {
      const response = await fcl
        .send([fcl.script(IS_PUBLIC_EVOLUTION_PAUSED)])
        .then(fcl.decode)

      setPublicEvolutionPaused(response)
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <TestSectionStyles>
      <TestSection id={id} title={title}>
        {publicEvolutionPaused != null ? (
          <h3>Public Evolution Paused: {String(publicEvolutionPaused)}</h3>
        ) : (
          ""
        )}
        <ActionItem>
          <FuncButton onClick={() => pausePublicEvolution()}>
            admin.pausePublicEvolution()
          </FuncButton>
        </ActionItem>
        <ActionItem>
          <FuncButton onClick={() => startPublicEvolution()}>
            admin.startPublicEvolution()
          </FuncButton>
        </ActionItem>
      </TestSection>
    </TestSectionStyles>
  )
}

export default OtherEvolutionAdminFunctions
