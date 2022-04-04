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
import { SETUP_BEAST_COLLECTION } from "@cadence/transactions/BasicBeasts/transaction.setup-account"

export default function useBasicBeasts(user: any) {
  const [state, dispatch] = useReducer(defaultReducer, {
    loading: true,
    error: false,
    data: null,
  })

  useEffect(() => {
    isBeastCollectionInitialized()
    //getAllBeastTemplates()
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

  return {
    ...state,
    isBeastCollectionInitialized,
    initializeBeastCollection,
  }
}
