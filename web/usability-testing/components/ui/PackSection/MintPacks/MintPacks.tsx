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
import { TableStyles } from "@components/ui/Table"
import { GET_ALL_NUMBER_MINTED_PER_PACK_TEMPLATE } from "@cadence/scripts/Pack/script.get-all-number-minted-per-pack-template"
import { FuncArgButton, FuncArgInput } from "@components/ui/FuncArgButton"
import { BATCH_MINT_PACK } from "@cadence/transactions/Pack/admin/transaction.batch-mint-pack"
import stockNumbers from "data/stockNumbers"

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

const MintPacks: FC<Props> = ({ id, title, user }) => {
  const [allNumberMintedPerPackTemplate, setAllNumberMintedPerPackTemplate] =
    useState()

  const [packTemplateID, setPackTemplateID] = useState<any | undefined>()

  useEffect(() => {
    getAllNumberMintedPerPackTemplate()
  }, [])

  const batchMintPack = async () => {
    let stockNumberArray: any[] = []

    for (let element in stockNumbers) {
      const stockNumber = stockNumbers[element].stockNumber
      stockNumberArray.push(stockNumber)
    }
    try {
      const res = await send([
        transaction(BATCH_MINT_PACK),
        args([
          arg(stockNumberArray, t.Array(t.UInt32)),
          arg(parseInt(packTemplateID), t.UInt32),
        ]),
        payer(authz),
        proposer(authz),
        authorizations([authz]),
        limit(9999),
      ]).then(decode)
      await tx(res).onceSealed()
      getAllNumberMintedPerPackTemplate()
    } catch (err) {
      console.log(err)
    }
  }

  const getAllNumberMintedPerPackTemplate = async () => {
    try {
      let response = await query({
        cadence: GET_ALL_NUMBER_MINTED_PER_PACK_TEMPLATE,
      })
      setAllNumberMintedPerPackTemplate(response)
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <TestSectionStyles>
      <TestSection id={id} title={title}>
        {allNumberMintedPerPackTemplate != null ? (
          <TableStyles>
            <table>
              <tr>
                <th />
                <th>Starter</th>
                <th>Metallic Silver</th>
                <th>Cursed Black</th>
                <th>Shiny Gold</th>
              </tr>
              <tr>
                <th>Minted</th>
                <th>
                  {JSON.stringify(allNumberMintedPerPackTemplate[1], null, 2)}
                </th>
                <th>
                  {JSON.stringify(allNumberMintedPerPackTemplate[2], null, 2)}
                </th>
                <th>
                  {JSON.stringify(allNumberMintedPerPackTemplate[3], null, 2)}
                </th>
                <th>
                  {JSON.stringify(allNumberMintedPerPackTemplate[4], null, 2)}
                </th>
              </tr>
            </table>
          </TableStyles>
        ) : (
          ""
        )}

        <ActionItem>
          <FuncArgInput
            placeholder="packTemplateID"
            type="text"
            onChange={(e: any) => setPackTemplateID(e.target.value)}
          />
          <FuncArgButton
            onClick={() => {
              batchMintPack()
            }}
          >
            mintPacks()
          </FuncArgButton>
        </ActionItem>
        <div>
          Stock numbers for minting (We use stock numbers to ensure we don't
          make too many packs and know which beast is to be inside a specific
          pack)
        </div>
        <pre>{JSON.stringify(stockNumbers, null, 2)}</pre>
      </TestSection>
    </TestSectionStyles>
  )
}

export default MintPacks
