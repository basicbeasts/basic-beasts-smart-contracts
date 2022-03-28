import { FC, useState } from "react"
import FuncButton from "@components/ui/FuncButton"
import TestSection, { TestSectionStyles } from "@components/ui/TestSection"
import { TableStyles } from "@components/ui/Table"
import styled from "styled-components"
import beastTemplatesFromData from "data/beastTemplates"
import BeastTemplate from "utils/BeastTemplate"
import BeastCard from "@components/ui/BeastCard"

const TestWrapper = styled.div`
  display: flex;
  width: 100%;
`

const Column = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
  width: 50%;
`

const FuncArgButton = styled.button`
  background: transparent;
  border: 1px solid #222;
  color: #222;
  font-size: 15px;
  padding: 10px 20px;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  &:hover {
    background: #000000;
    color: #fff;
  }
`

const FuncArgInput = styled.input`
  background: transparent;
  border: 1px solid #222;
  color: #222;
  font-size: 15px;
  padding: 10px 20px;
  border-radius: 8px 0 0 8px;
  cursor: pointer;
  margin-right: -1px;
`

type Props = {
  id: any
  title: String
  beastTemplateData: any
  getBeastTemplate: any
  createBeastTemplate: any
  fetchedBeastTemplate: any
}

const ViewCreateBeastTemplate: FC<Props> = ({
  id,
  title,
  beastTemplateData,
  getBeastTemplate,
  createBeastTemplate,
  fetchedBeastTemplate,
}) => {
  const [beastTemplateID, setBeastTemplateID] = useState()
  const [beastTemplateCreated, setBeastTemplateCreated] = useState<
    Boolean | undefined
  >()
  const [beastTemplate, setBeastTemplate] = useState<
    BeastTemplate | undefined
  >()

  const getBeastTemplateFromData = () => {
    setBeastTemplate(beastTemplatesFromData[beastTemplateID])
    isBeastTemplateCreated()
  }

  const isBeastTemplateCreated = () => {
    setBeastTemplateCreated(false)
    var i = 0
    while (i < beastTemplateData.length) {
      if (beastTemplateData[i].beastTemplateID == beastTemplateID) {
        setBeastTemplateCreated(true)
      }
      i = i + 1
    }
  }

  return (
    <TestSectionStyles>
      <TestSection id={id} title={title}>
        <br />
        {beastTemplateData != null ? (
          <>
            <TestWrapper>
              <div>
                <FuncArgInput
                  placeholder="beastTemplateID"
                  type="text"
                  onChange={(e: any) => setBeastTemplateID(e.target.value)}
                />
                <FuncArgButton
                  onClick={() => {
                    getBeastTemplateFromData()

                    getBeastTemplate(beastTemplateID)
                  }}
                >
                  Search
                </FuncArgButton>
                <br />
                <br />
                {beastTemplateCreated == true ? (
                  <div className="green-text">beastTemplateCreated = true</div>
                ) : (
                  <>
                    {beastTemplateCreated == false ? (
                      <div className="red-text">
                        beastTemplateCreated = false
                      </div>
                    ) : (
                      <></>
                    )}
                  </>
                )}
                <br />
                <FuncButton
                  onClick={() => createBeastTemplate(beastTemplateID)}
                >
                  <span>adminRef.createBeastTemplate(...)</span>
                </FuncButton>
              </div>
              {beastTemplate != null ? (
                <Column>
                  <BeastCard beastTemplate={beastTemplate} />
                </Column>
              ) : (
                <></>
              )}
            </TestWrapper>

            {beastTemplate != null && fetchedBeastTemplate != null ? (
              <>
                <FuncButton
                  onClick={() => {
                    getBeastTemplate(beastTemplateID)
                    console.log(fetchedBeastTemplate.name)
                  }}
                >
                  getBeastTemplate(beastTemplateID)
                </FuncButton>
                <br />
                <br />
                <h3>Comparison db level vs on-chain</h3>
                <TableStyles>
                  <table>
                    <tr>
                      <th />
                      <th>DB level</th>
                      <th>On-chain</th>
                    </tr>
                    <tr>
                      <th>beastTemplateID</th>
                      <td>{beastTemplate.beastTemplateID} </td>
                      <td>{fetchedBeastTemplate.beastTemplateID}</td>
                    </tr>
                    <tr>
                      <th>generation</th>
                      <td>{beastTemplate.generation} </td>
                      <td>{fetchedBeastTemplate.generation}</td>
                    </tr>
                    <tr>
                      <th>dexNumber</th>
                      <td>{beastTemplate.dexNumber} </td>
                      <td>{fetchedBeastTemplate.dexNumber}</td>
                    </tr>
                    <tr>
                      <th>name</th>
                      <td>{beastTemplate.name} </td>
                      <td>{fetchedBeastTemplate.name}</td>
                    </tr>
                    <tr>
                      <th>skin</th>
                      <td>{beastTemplate.skin} </td>
                      <td>{fetchedBeastTemplate.skin}</td>
                    </tr>
                  </table>
                </TableStyles>
              </>
            ) : (
              <></>
            )}
          </>
        ) : (
          <>
            {" "}
            <FuncButton onClick={() => createBeastTemplate(beastTemplateID)}>
              <span>adminRef.createBeastTemplate(...)</span>
            </FuncButton>
          </>
        )}
      </TestSection>
    </TestSectionStyles>
  )
}

export default ViewCreateBeastTemplate
