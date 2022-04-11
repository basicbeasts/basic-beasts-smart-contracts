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
import packTemplatesFromData from "data/packTemplates"
import { GET_ALL_PACK_TEMPLATES } from "@cadence/scripts/Pack/script.get-all-pack-templates"
import { CREATE_PACK_TEMPLATE } from "@cadence/transactions/Pack/admin/transaction.create-pack-template"

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

const CreateAllPackTemplates: FC<Props> = ({ id, title }) => {
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

  const createPackTemplate = async (packTemplateID: number) => {
    let packTemplate = packTemplatesFromData[packTemplateID]

    try {
      const res = await send([
        transaction(CREATE_PACK_TEMPLATE),
        args([
          arg(packTemplate.packTemplateID, t.UInt32),
          arg(packTemplate.name, t.String),
          arg(packTemplate.image, t.String),
          arg(packTemplate.description, t.String),
        ]),
        payer(authz),
        proposer(authz),
        authorizations([authz]),
        limit(9999),
      ]).then(decode)
      await tx(res).onceSealed()
      getAllPackTemplates()
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <TestSectionStyles>
      <TestSection id={id} title={title}>
        <FuncButton onClick={() => createPackTemplate(1)}>
          Create Starter
        </FuncButton>
        <FuncButton onClick={() => createPackTemplate(2)}>
          Create Metallic Silver
        </FuncButton>
        <FuncButton onClick={() => createPackTemplate(3)}>
          Create Cursed Black
        </FuncButton>
        <FuncButton onClick={() => createPackTemplate(4)}>
          Create Shiny Gold
        </FuncButton>
        <ActionItem>
          <FuncButton onClick={() => getAllPackTemplates()}>
            getAllPackTemplates()
          </FuncButton>
          {packTemplates != null ? (
            <>
              <pre>{JSON.stringify(packTemplates, null, 2)}</pre>
            </>
          ) : (
            ""
          )}
        </ActionItem>
      </TestSection>
    </TestSectionStyles>
  )
}

export default CreateAllPackTemplates
