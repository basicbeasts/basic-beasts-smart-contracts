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
import * as t from "@onflow/types"
import { useEffect, useReducer, useState } from "react"
import { defaultReducer } from "reducer/defaultReducer"
import { GET_NUM_MINTED_PER_BEAST_TEMPLATE } from "@cadence/scripts/BasicBeasts/script.get-num-minted-per-beast-template"

export default function useBeast(user: any) {
  const [state, dispatch] = useReducer(defaultReducer, {
    loading: true,
    error: false,
    data: null,
  })
  const [numMintedPerBeastTemplate, setNumMintedPerBeastTemplate] =
    useState(null)

  useEffect(() => {}, [user?.addr])

  // Script
  const getNumMintedPerBeastTemplate = async (beastTemplateID: any) => {
    dispatch({ type: "PROCESSING" })
    setNumMintedPerBeastTemplate(null)
    try {
      let response = await query({
        cadence: GET_NUM_MINTED_PER_BEAST_TEMPLATE,
        args: (arg: any, t: any) => [arg(parseInt(beastTemplateID), t.UInt32)],
      })

      setNumMintedPerBeastTemplate(response)
      dispatch({ type: "SUCCESS", payload: response })
    } catch (err) {
      dispatch({ type: "ERROR" })
      console.log(err)
    }
  }

  return {
    ...state,
    getNumMintedPerBeastTemplate,
    numMintedPerBeastTemplate,
  }
}
