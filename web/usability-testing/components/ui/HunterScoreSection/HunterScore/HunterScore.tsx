import { FC, useEffect, useState } from "react"
import FuncButton from "@components/ui/FuncButton"
import TestSection, { TestSectionStyles } from "@components/ui/TestSection"
import styled from "styled-components"
import * as fcl from "@onflow/fcl"
import { GET_HUNTER_SCORES } from "@cadence/scripts/HunterScore/script.get-hunter-scores"
import { GET_ALL_BEAST_TEMPLATES_COLLECTED } from "@cadence/scripts/HunterScore/script.get-all-beast-templates-collected"
import { GET_ALL_BEASTS_COLLECTED } from "@cadence/scripts/HunterScore/script.get-all-beasts-collected"

const ActionItem = styled.div`
  padding: 10px 0;
`

type Props = {
  id: any
  title: String
}

const HunterScore: FC<Props> = ({ id, title }) => {
  const [hunterScores, setHunterScores] = useState()
  const [beastsCollected, setBeastsCollected] = useState()
  const [beastTemplatesCollected, setBeastTemplatesCollected] = useState()

  useEffect(() => {
    getHunterScores()
    getAllBeastsCollected()
    getAllBeastTemplatesCollected()
  }, [])

  const getHunterScores = async () => {
    try {
      const response = await fcl
        .send([fcl.script(GET_HUNTER_SCORES)])
        .then(fcl.decode)

      setHunterScores(response)
    } catch (err) {
      console.log(err)
    }
  }
  const getAllBeastsCollected = async () => {
    try {
      const response = await fcl
        .send([fcl.script(GET_ALL_BEASTS_COLLECTED)])
        .then(fcl.decode)

      setBeastsCollected(response)
    } catch (err) {
      console.log(err)
    }
  }
  const getAllBeastTemplatesCollected = async () => {
    try {
      const response = await fcl
        .send([fcl.script(GET_ALL_BEAST_TEMPLATES_COLLECTED)])
        .then(fcl.decode)

      setBeastTemplatesCollected(response)
    } catch (err) {
      console.log(err)
    }
  }

  const fetch = () => {
    getHunterScores()
    getAllBeastsCollected()
    getAllBeastTemplatesCollected()
  }

  return (
    <TestSectionStyles>
      <TestSection id={id} title={title}>
        <FuncButton onClick={() => fetch()}>Fetch Hunter Score Data</FuncButton>
        <h3>getHunterScores()</h3>
        {hunterScores != null ? (
          <pre>{JSON.stringify(hunterScores, null, 2)}</pre>
        ) : (
          ""
        )}
        <h3>getAllBeastsCollected()</h3>
        {beastsCollected != null ? (
          <pre>{JSON.stringify(beastsCollected, null, 2)}</pre>
        ) : (
          ""
        )}
        <h3>getAllBeastTemplatesCollected()</h3>
        {beastTemplatesCollected != null ? (
          <pre>{JSON.stringify(beastTemplatesCollected, null, 2)}</pre>
        ) : (
          ""
        )}
      </TestSection>
    </TestSectionStyles>
  )
}

export default HunterScore
