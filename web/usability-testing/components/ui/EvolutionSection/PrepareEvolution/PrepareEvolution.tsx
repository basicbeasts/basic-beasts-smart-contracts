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
import { SETUP_EVOLVER } from "@cadence/transactions/Evolution/transaction.setup-evolver"
import Dropdown from "react-dropdown"
import { FuncArgButton, FuncArgInput } from "@components/ui/FuncArgButton"
import { IS_EVOLVER_INITIALIZED } from "@cadence/scripts/Evolution/script.is-evolver-initialized"
import evolutionPairsFromData from "data/evolutionPairs"
import beastTemplatesFromData from "data/beastTemplates"
import BeastTemplate from "utils/BeastTemplate"
import BeastCard from "@components/ui/BeastCard"
import { ADD_EVOLUTION_PAIR } from "@cadence/transactions/Evolution/admin/transaction.add-evolution-pair"
import { GET_ALL_EVOLUTION_PAIRS } from "@cadence/scripts/Evolution/script.get-all-evolution-pairs"
import mythicPairsFromData from "data/mythicPairs"
import { ADD_MYTHIC_PAIR } from "@cadence/transactions/Evolution/admin/transaction.add-mythic-pair"
import { GET_ALL_MYTHIC_PAIRS } from "@cadence/scripts/Evolution/script.get-all-mythic-pairs"

const TextAlert = styled.div`
  margin: 20px 0;
`

const AddPairs = styled.div`
  margin-top: 20px;
`

const ActionItem = styled.div`
  padding: 10px 0;
`

const Column = styled.div`
  justify-content: center;
  align-items: center;
  display: flex;
`

const Divider = styled.hr`
  border-top: 1px solid rgb(235, 238, 241);
  margin-bottom: 20px;
`

type Props = {
  id: any
  title: String
  user: any
}

const PrepareEvolution: FC<Props> = ({ id, title, user }) => {
  const [evolverInitialized, setEvolverInitialized] = useState(false)
  // Evolution Pair
  const [lowerLevelBeastTemplateID, setLowerLevelBeastTemplateID] = useState()
  const [lowerLevelBeast, setLowerLevelBeast] = useState<
    BeastTemplate | undefined
  >()
  const [higherLevelBeast, setHigherLevelBeast] = useState<
    BeastTemplate | undefined
  >()
  const [evolutionPairCreated, setEvolutionPairCreated] = useState<Boolean>()
  const [allEvolutionPairs, setAllEvolutionPairs] = useState()

  // Mythic Pair
  const [evolvedBeastTemplateID, setEvolvedBeastTemplateID] = useState()
  const [evolvedBeast, setEvolvedBeast] = useState<BeastTemplate | undefined>()
  const [mythicBeast, setMythicBeast] = useState<BeastTemplate | undefined>()
  const [allMythicPairs, setAllMythicPairs] = useState()

  useEffect(() => {
    isEvolverInitialized()
    getAllEvolutionPairs()
    getAllMythicPairs()
  }, [user?.addr])

  const createNewEvolver = async () => {
    try {
      const res = await send([
        transaction(SETUP_EVOLVER),
        payer(authz),
        proposer(authz),
        authorizations([authz]),
        limit(9999),
      ]).then(decode)
      await tx(res).onceSealed()
      isEvolverInitialized()
    } catch (err) {
      console.log(err)
    }
  }

  const addEvolutionPair = async () => {
    try {
      const res = await send([
        transaction(ADD_EVOLUTION_PAIR),
        args([
          arg(
            parseInt(
              evolutionPairsFromData[lowerLevelBeastTemplateID]
                .lowerLevelBeastTemplateID,
            ),
            t.UInt32,
          ),
          arg(
            parseInt(
              evolutionPairsFromData[lowerLevelBeastTemplateID]
                .higherLevelBeastTemplateID,
            ),
            t.UInt32,
          ),
        ]),
        payer(authz),
        proposer(authz),
        authorizations([authz]),
        limit(9999),
      ]).then(decode)
      await tx(res).onceSealed()
      getAllEvolutionPairs()
    } catch (err) {
      console.log(err)
    }
  }

  const isEvolverInitialized = async () => {
    try {
      let response = await query({
        cadence: IS_EVOLVER_INITIALIZED,
        args: (arg: any, t: any) => [arg(user?.addr, t.Address)],
      })
      setEvolverInitialized(response)

      getAllEvolutionPairs()
    } catch (err) {
      console.log(err)
    }
  }

  const getAllEvolutionPairs = async () => {
    try {
      let response = await query({
        cadence: GET_ALL_EVOLUTION_PAIRS,
      })
      setAllEvolutionPairs(response)
    } catch (err) {
      console.log(err)
    }
  }

  const addMythicPair = async () => {
    try {
      const res = await send([
        transaction(ADD_MYTHIC_PAIR),
        args([
          arg(
            parseInt(
              mythicPairsFromData[evolvedBeastTemplateID]
                .evolvedBeastTemplateID,
            ),
            t.UInt32,
          ),
          arg(
            parseInt(
              mythicPairsFromData[evolvedBeastTemplateID].mythicBeastTemplateID,
            ),
            t.UInt32,
          ),
        ]),
        payer(authz),
        proposer(authz),
        authorizations([authz]),
        limit(9999),
      ]).then(decode)
      await tx(res).onceSealed()
      getAllMythicPairs()
    } catch (err) {
      console.log(err)
    }
  }

  const getAllMythicPairs = async () => {
    try {
      let response = await query({
        cadence: GET_ALL_MYTHIC_PAIRS,
      })
      setAllMythicPairs(response)
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <TestSectionStyles>
      <TestSection id={id} title={title}>
        <h3>Setup Evolver</h3>
        <FuncButton onClick={() => createNewEvolver()}>
          createNewEvolver()
        </FuncButton>
        {evolverInitialized ? (
          <TextAlert className="green-text">Evolver is initialized</TextAlert>
        ) : (
          <>
            <TextAlert className="red-text">
              Evolver is not initialized
            </TextAlert>
          </>
        )}
        <AddPairs>
          <Divider />
          <h3>Add Evolution Pair</h3>
          <ActionItem>
            <FuncArgInput
              placeholder="Lower Level ID"
              type="text"
              onChange={(e: any) =>
                setLowerLevelBeastTemplateID(e.target.value)
              }
            />
            <FuncArgButton
              onClick={() => {
                setLowerLevelBeast(
                  beastTemplatesFromData[
                    evolutionPairsFromData[lowerLevelBeastTemplateID]
                      .lowerLevelBeastTemplateID
                  ],
                )
                setHigherLevelBeast(
                  beastTemplatesFromData[
                    evolutionPairsFromData[lowerLevelBeastTemplateID]
                      .higherLevelBeastTemplateID
                  ],
                )
              }}
            >
              Fetch EvolutionPair
            </FuncArgButton>
          </ActionItem>
          {lowerLevelBeast != null && higherLevelBeast != null ? (
            <>
              <div>
                lower level beast: {lowerLevelBeast.skin} - star level:{" "}
                {lowerLevelBeast.starLevel} - templateID:{" "}
                {lowerLevelBeast.beastTemplateID}
              </div>
              <div>
                higher level beast: {higherLevelBeast.skin} - star level:{" "}
                {higherLevelBeast.starLevel} - templateID:{" "}
                {higherLevelBeast.beastTemplateID}
              </div>
              <div>TODO: check if evolution pair is created</div>
              <Column>
                <BeastCard beastTemplate={lowerLevelBeast} />
                <BeastCard beastTemplate={higherLevelBeast} />
              </Column>
            </>
          ) : (
            <>
              <div>Couldn't find evolution pair</div>
            </>
          )}
          <ActionItem>
            <FuncButton onClick={() => addEvolutionPair()}>
              admin.addEvolutionPair()
            </FuncButton>
          </ActionItem>
          <h3>getAllEvolutionPairs()</h3>
          <pre>{JSON.stringify(allEvolutionPairs, null, 2)}</pre>
          <Divider />
          <h3>Add Mythic Pair</h3>
          <ActionItem>
            <FuncArgInput
              placeholder="Evolved Beast ID"
              type="text"
              onChange={(e: any) => setEvolvedBeastTemplateID(e.target.value)}
            />
            <FuncArgButton
              onClick={() => {
                setEvolvedBeast(
                  beastTemplatesFromData[
                    mythicPairsFromData[evolvedBeastTemplateID]
                      .evolvedBeastTemplateID
                  ],
                )
                setMythicBeast(
                  beastTemplatesFromData[
                    mythicPairsFromData[evolvedBeastTemplateID]
                      .mythicBeastTemplateID
                  ],
                )
              }}
            >
              Fetch MythicPair
            </FuncArgButton>
          </ActionItem>
          {evolvedBeast != null && mythicBeast != null ? (
            <>
              <div>
                evolved beast: {evolvedBeast.skin} - star level:{" "}
                {evolvedBeast.starLevel} - templateID:{" "}
                {evolvedBeast.beastTemplateID}
              </div>
              <div>
                mythic beast: {mythicBeast.skin} - star level:{" "}
                {mythicBeast.starLevel} - templateID:{" "}
                {mythicBeast.beastTemplateID}
              </div>
              <div>TODO: check if mythic pair is created</div>
              <Column>
                <BeastCard beastTemplate={evolvedBeast} />
                <BeastCard beastTemplate={mythicBeast} />
              </Column>
            </>
          ) : (
            <>
              <div>Couldn't find mythic pair</div>
            </>
          )}
          <ActionItem>
            <FuncButton onClick={() => addMythicPair()}>
              admin.addMythicPair()
            </FuncButton>
          </ActionItem>
          <h3>getAllMythicPairs()</h3>
          <pre>{JSON.stringify(allMythicPairs, null, 2)}</pre>
        </AddPairs>
      </TestSection>
    </TestSectionStyles>
  )
}

export default PrepareEvolution
