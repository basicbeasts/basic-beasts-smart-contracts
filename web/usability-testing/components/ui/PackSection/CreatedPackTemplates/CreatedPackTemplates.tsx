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
}

const CreatedPackTemplates: FC<Props> = ({ id, title }) => {
  const [packTemplates, setPackTemplates] = useState()

  useEffect(() => {
    getAllPackTemplates()
  }, [])

  const getAllPackTemplates = async () => {
    try {
      let response = await query({
        cadence: GET_ALL_PACK_TEMPLATES,
      })
      setPackTemplates(response)
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <TestSectionStyles>
      <TestSection id={id} title={title}>
        <FuncButton onClick={() => getAllPackTemplates()}>
          getAllPackTemplates()
        </FuncButton>
        {packTemplates != null ? (
          <pre>{JSON.stringify(packTemplates, null, 2)}</pre>
        ) : (
          ""
        )}
      </TestSection>
    </TestSectionStyles>
  )
}

export default CreatedPackTemplates
