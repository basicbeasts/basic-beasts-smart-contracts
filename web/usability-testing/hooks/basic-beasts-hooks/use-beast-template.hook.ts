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
import { GET_ALL_BEAST_TEMPLATES } from "@cadence/scripts/BasicBeasts/script.get-all-beast-templates"
import BeastTemplate from "utils/BeastTemplate"
import beastTemplates from "data/beastTemplates"
import { CREATE_BEAST_TEMPLATE } from "@cadence/transactions/BasicBeasts/admin/transaction.create-beast-template"
import { GET_BEAST_TEMPLATE } from "@cadence/scripts/BasicBeasts/script.get-beast-template"
import { GET_ALL_BEAST_TEMPLATE_IDS } from "@cadence/scripts/BasicBeasts/script.get-all-beast-template-ids"
import { authorizationFunction } from "authorization"

export default function useBeastTemplate(user: any) {
  const [state, dispatch] = useReducer(defaultReducer, {
    loading: true,
    error: false,
    data: null,
  })
  const [beastTemplateData, setBeastTemplateData] = useState(null)
  const [fetchedBeastTemplate, setBeastTemplate] = useState(null)
  const [beastTemplateIDs, setBeastTemplateIDs] = useState(null)

  useEffect(() => {
    getAllBeastTemplates()
    getAllBeastTemplateIDs()
  }, [user?.addr])

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
          element.animationUrl,
          element.externalUrl,
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
      setBeastTemplateData(mappedBeastTemplates)
    } catch (err) {
      dispatch({ type: "ERROR" })
      console.log(err)
    }
  }

  // Transaction - Create Beast Template
  const createBeastTemplate = async (beastTemplateID: number) => {
    dispatch({ type: "PROCESSING" })

    let beastTemplate = beastTemplates[beastTemplateID]

    let name = beastTemplate.name

    let key = "data test"

    var data: any[] = []

    data.push({ key: key, value: name })

    console.log(data[0])

    try {
      const res = await send([
        transaction(CREATE_BEAST_TEMPLATE),
        // args([
        //   arg(beastTemplate.beastTemplateID, t.UInt32),
        //   arg(beastTemplate.dexNumber, t.UInt32),
        //   arg(beastTemplate.name, t.String),
        //   arg(beastTemplate.description, t.String),
        //   arg(beastTemplate.image, t.String),
        //   arg(beastTemplate.imageTransparentBg, t.String),
        //   arg(beastTemplate.animationUrl, t.Optional(t.String)),
        //   arg(beastTemplate.externalUrl, t.Optional(t.String)),
        //   arg(beastTemplate.rarity, t.String),
        //   arg(beastTemplate.skin, t.String),
        //   arg(beastTemplate.starLevel, t.UInt32),
        //   arg(beastTemplate.asexual, t.Bool),
        //   arg(beastTemplate.breedableBeastTemplateID, t.UInt32),
        //   arg(beastTemplate.maxAdminMintAllowed, t.UInt32),
        //   arg(beastTemplate.ultimateSkill, t.String),
        //   arg(beastTemplate.basicSkills, t.Array(t.String)),
        //   arg(beastTemplate.elements, t.Array(t.String)),
        //   arg(
        //     beastTemplate.data,
        //     t.Dictionary({ key: t.String, value: t.String }),
        //   ),
        // ]),
        //Testing Data
        args([
          arg(beastTemplate.beastTemplateID, t.UInt32),
          arg(beastTemplate.dexNumber, t.UInt32),
          arg(beastTemplate.name, t.String),
          arg(beastTemplate.description, t.String),
          arg(beastTemplate.image, t.String),
          arg(beastTemplate.imageTransparentBg, t.String),
          arg(beastTemplate.animationUrl, t.Optional(t.String)),
          arg(beastTemplate.externalUrl, t.Optional(t.String)),
          arg(beastTemplate.rarity, t.String),
          arg(beastTemplate.skin, t.String),
          arg(beastTemplate.starLevel, t.UInt32),
          arg(beastTemplate.asexual, t.Bool),
          arg(beastTemplate.breedableBeastTemplateID, t.UInt32),
          arg(beastTemplate.maxAdminMintAllowed, t.UInt32),
          arg(beastTemplate.ultimateSkill, t.String),
          arg(beastTemplate.basicSkills, t.Array(t.String)),
          arg(beastTemplate.elements, t.Array(t.String)),
          arg(data, t.Dictionary({ key: t.String, value: t.String })),
        ]),
        payer(authorizationFunction),
        proposer(authorizationFunction),
        authorizations([authorizationFunction]),
        limit(9999),
      ]).then(decode)

      const trx = await tx(res).onceSealed()
      getAllBeastTemplates()
      getAllBeastTemplateIDs()
      return trx
    } catch (err) {
      dispatch({ type: "ERROR" })
      console.log(err)
    }
  }

  // Script
  // Script - Get beast template from ID
  const getBeastTemplate = async (beastTemplateID: any) => {
    dispatch({ type: "PROCESSING" })
    setBeastTemplate(null)
    try {
      let element = await query({
        cadence: GET_BEAST_TEMPLATE,
        args: (arg: any, t: any) => [arg(parseInt(beastTemplateID), t.UInt32)],
      })

      let beastTemplate = new BeastTemplate(
        element.beastTemplateID,
        element.generation,
        element.dexNumber,
        element.name,
        element.description,
        element.image,
        element.imageTransparentBg,
        element.animationUrl,
        element.externalUrl,
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

      setBeastTemplate(beastTemplate)
      dispatch({ type: "SUCCESS", payload: beastTemplate })
    } catch (err) {
      dispatch({ type: "ERROR" })
      console.log(err)
    }
  }

  // Script
  // Script - Get all beast template IDs
  const getAllBeastTemplateIDs = async () => {
    dispatch({ type: "PROCESSING" })

    try {
      let beastTemplateIDs = await query({
        cadence: GET_ALL_BEAST_TEMPLATE_IDS,
      })

      dispatch({ type: "SUCCESS", payload: beastTemplateIDs })

      beastTemplateIDs.sort(function (a: any, b: any) {
        return a - b
      })

      setBeastTemplateIDs(beastTemplateIDs)
    } catch (err) {
      dispatch({ type: "ERROR" })
      console.log(err)
    }
  }

  return {
    ...state,
    getAllBeastTemplates,
    createBeastTemplate,
    beastTemplateData,
    getBeastTemplate,
    fetchedBeastTemplate,
    getAllBeastTemplateIDs,
    beastTemplateIDs,
  }
}
