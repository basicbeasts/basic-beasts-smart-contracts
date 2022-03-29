import { FC, useEffect, useState } from "react"
import FuncButton from "@components/ui/FuncButton"
import TestSection, { TestSectionStyles } from "@components/ui/TestSection"
import styled from "styled-components"
import * as fcl from "@onflow/fcl"

const GetInfo = styled.button`
  background: transparent;
  color: #222;
  border: 1px solid #9a9a9a80;
  font-size: 15px;
  font-weight: 700;
  padding: 10px;
  border-radius: 8px 0 0 8px;
  margin-right: -1px;
`

const GetButton = styled.button`
  background: #9a9a9a80;
  color: #fff;
  border: 1px solid #9a9a9a80;
  font-size: 15px;
  padding: 10px;
  border-radius: 0 8px 8px 0;
  cursor: pointer;
  &:hover {
    background: #9a9a9a;
    border: 1px solid #9a9a9a;
  }
`

type Props = {
  id: any
  title: String
}

const OtherAdminFunctions: FC<Props> = ({ id, title }) => {
  const [generation, setGeneration] = useState()

  useEffect(() => {
    getCurrentGeneration()
  }, [])

  // Running a Script
  const getCurrentGeneration = async () => {
    const response = await fcl
      .send([
        fcl.script`
		  import BasicBeasts from 0xBasicBeasts

		  pub fun main(): UInt32 {
			  return BasicBeasts.currentGeneration
		  }
		  `,
      ])
      .then(fcl.decode)

    setGeneration(response)
  }

  // Running a Transaction
  const startNewGeneration = async () => {
    const txId = await fcl
      .send([
        fcl.transaction`
		import BasicBeasts from 0xBasicBeasts

		transaction {
		
			let adminRef: &BasicBeasts.Admin
			let currentGeneration: UInt32
		
			prepare(acct: AuthAccount) {
				self.adminRef = acct.borrow<&BasicBeasts.Admin>(from: BasicBeasts.AdminStoragePath)
					?? panic("No Admin resource in storage")
		
				self.currentGeneration = BasicBeasts.currentGeneration
		
			}
		
			execute {
				self.adminRef.startNewGeneration()
			}
		
			post {
				BasicBeasts.currentGeneration == self.currentGeneration + 1 as UInt32:
					"New Generation is not started"
			}
		}
      `,
        fcl.proposer(fcl.authz),
        fcl.payer(fcl.authz),
        fcl.authorizations([fcl.authz]),
        fcl.limit(9999),
      ])
      .then(fcl.decode)

    getCurrentGeneration() // Runs currentGeneration getter script
  }

  return (
    <TestSectionStyles>
      <TestSection id={id} title={title}>
        <GetInfo>
          <span>Current Generation: {generation}</span>
        </GetInfo>
        <GetButton onClick={getCurrentGeneration}>
          <span>getGeneration()</span>
        </GetButton>
        <br />
        <br />
        <FuncButton onClick={startNewGeneration}>
          <span>adminRef.startNewGeneration()</span>
        </FuncButton>
        <br />
      </TestSection>
    </TestSectionStyles>
  )
}

export default OtherAdminFunctions
