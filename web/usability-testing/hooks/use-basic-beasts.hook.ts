/** BasicBeasts.cdc
 * Contract has 32 functions. So we should have a total of 32 scripts and transactions in this hook.
 */

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
import { useEffect, useReducer } from "react"
import { defaultReducer } from "reducer/defaultReducer"
import { HAS_BASIC_BEASTS_COLLECTION } from "@cadence/scripts/BasicBeasts/script.has-basic-beasts-collection"
import { SETUP_BEAST_COLLECTION } from "@cadence/transactions/BasicBeasts/transaction.setup_account"
import { GET_ALL_BEAST_TEMPLATES } from "@cadence/scripts/BasicBeasts/script.get-all-beast-templates"
import BeastTemplate from "utils/BeastTemplate"
import beastTemplates from "data/beastTemplates"
import { CREATE_BEAST_TEMPLATE } from "@cadence/transactions/BasicBeasts/admin/transaction.create-beast-template"

export default function useBasicBeasts(user: any) {
  const [state, dispatch] = useReducer(defaultReducer, {
    loading: true,
    error: false,
    data: null,
  })

  useEffect(() => {
    isBeastCollectionInitialized()
  }, [user?.addr])

  // Script - Is Beast Collection Initialized
  const isBeastCollectionInitialized = async () => {
    dispatch({ type: "PROCESSING" })

    try {
      let response = await query({
        cadence: HAS_BASIC_BEASTS_COLLECTION,
        args: (arg: any, t: any) => [arg(user?.addr, t.Address)],
      })
      dispatch({ type: "SUCCESS", payload: response })
    } catch (err) {
      dispatch({ type: "ERROR" })
      console.log(err)
    }
  }

  // Transaction - no param. Setup account
  const initializeBeastCollection = async () => {
    dispatch({ type: "PROCESSING" })

    try {
      const res = await send([
        transaction(SETUP_BEAST_COLLECTION),
        ,
        payer(authz),
        proposer(authz),
        authorizations([authz]),
        limit(9999),
      ]).then(decode)
      // wait for transaction to be mined
      const trx = await tx(res).onceSealed()
      // this will refetch the balance once transaction is mined
      // basically acts as a dispatcher allowing to update balance once transaction is mined
      isBeastCollectionInitialized()
      // we return the transaction body and can handle it in the component
      return trx
    } catch (err) {
      dispatch({ type: "ERROR" })
      console.log(err)
    }
  }

  // Script - Get all beast templates
  const getAllBeastTemplates = async () => {
    dispatch({ type: "PROCESSING" })

    try {
      let beastTemplates = await query({
        cadence: GET_ALL_BEAST_TEMPLATES,
      })
      let mappedBeastTemplates = []

      for (let beastTemplateID in beastTemplates) {
        const element = beastTemplates[beastTemplateID]
        let beastTemplate = new BeastTemplate(
          element.beastTemplateID,
          element.generation,
          element.dexNumber,
          element.name,
          element.description,
          element.image,
          element.imageTransparentBg,
          element.animation_url,
          element.external_url,
          element.rarity,
          element.skin,
          element.starLevel,
          element.asexual,
          element.breedableBeastTemplateID,
          element.maxAdminMintAllowed,
          element.ultimateSkill,
          element.basicSkills,
          element.elements,
          element.data,
        )
        console.log(beastTemplate)
        mappedBeastTemplates.push(beastTemplate)
      }

      dispatch({ type: "SUCCESS", payload: mappedBeastTemplates })
    } catch (err) {
      dispatch({ type: "ERROR" })
      console.log(err)
    }
  }

  // Transaction - Create Beast Template
  const createBeastTemplate = async (beastTemplateID: number) => {
    dispatch({ type: "PROCESSING" })

    let beastTemplate = beastTemplates[beastTemplateID]

    console.log(beastTemplates[beastTemplateID])

    try {
      const res = await send([
        transaction(CREATE_BEAST_TEMPLATE),
        args([
          arg(beastTemplate.beastTemplateID, t.UInt32),
          arg(beastTemplate.dexNumber, t.UInt32),
          arg(beastTemplate.name, t.String),
          arg(beastTemplate.description, t.String),
          arg(beastTemplate.image, t.String),
          arg(beastTemplate.imageTransparentBg, t.String),
          arg(beastTemplate.animation_url, t.Optional(t.String)),
          arg(beastTemplate.external_url, t.Optional(t.String)),
          arg(beastTemplate.rarity, t.String),
          arg(beastTemplate.skin, t.String),
          arg(beastTemplate.starLevel, t.UInt32),
          arg(beastTemplate.asexual, t.Bool),
          arg(beastTemplate.breedableBeastTemplateID, t.UInt32),
          arg(beastTemplate.maxAdminMintAllowed, t.UInt32),
          arg(beastTemplate.ultimateSkill, t.String),
          arg(beastTemplate.basicSkills, t.Array(t.String)),
          arg(beastTemplate.elements, t.Array(t.String)),
          arg(
            beastTemplate.data,
            t.Dictionary({ key: t.String, value: t.String }),
          ),
        ]),
        // args([
        //   arg(1, t.UInt32),
        //   arg(1, t.UInt32),
        //   arg("Moon", t.String),
        //   arg("Description", t.String),
        //   arg("Image", t.String),
        //   arg("imageTransparentBg", t.String),
        //   arg("null", t.Optional(t.String)),
        //   arg("null", t.Optional(t.String)),
        //   arg("Common", t.String),
        //   arg("Normal", t.String),
        //   arg(false, t.Bool),
        //   arg(1, t.UInt32),
        //   arg(1000, t.UInt32),
        //   arg("Crash", t.String),
        //   arg(["Basic"], t.Array(t.String)),
        //   arg(["Electric"], t.Array(t.String)),
        //   arg(
        //     { key: "", value: "" },
        //     t.Dictionary({ key: t.String, value: t.String }),
        //   ),
        // ]),
        payer(authz),
        proposer(authz),
        authorizations([authz]),
        limit(9999),
      ]).then(decode)

      const trx = await tx(res).onceSealed()
      return trx
    } catch (err) {
      dispatch({ type: "ERROR" })
      console.log(err)
    }
  }

  return {
    ...state,
    isBeastCollectionInitialized,
    initializeBeastCollection,
    getAllBeastTemplates,
    createBeastTemplate,
  }
}
