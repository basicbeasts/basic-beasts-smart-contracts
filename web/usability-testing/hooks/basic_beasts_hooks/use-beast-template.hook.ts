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

export default function useBeastTemplate(user: any) {
  const [state, dispatch] = useReducer(defaultReducer, {
    loading: true,
    error: false,
    data: null,
  })
  const [beastTemplateData, setBeastTemplateData] = useState(null)

  useEffect(() => {
    getAllBeastTemplates()
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
      getAllBeastTemplates()
      return trx
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
  }
}
