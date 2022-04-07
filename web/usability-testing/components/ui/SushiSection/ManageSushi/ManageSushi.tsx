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
import { SETUP_SUSHI_VAULT } from "@cadence/transactions/Sushi/transaction.setup-sushi-vault"
import { IS_SUSHI_VAULT_INITIALIZED } from "@cadence/scripts/Sushi/script.is-sushi-vault-initialized"
import { GET_SUSHI_TOTAL_SUPPLY } from "@cadence/scripts/Sushi/script.get-total-supply"
import { GET_SUSHI_BALANCE } from "@cadence/scripts/Sushi/script.get-balance"
import { SUSHI_CREATE_NEW_MINTER } from "@cadence/transactions/Sushi/administrator/transaction.create-new-minter"
import { SUSHI_MINT_TOKENS } from "@cadence/transactions/Sushi/administrator/transaction.mint-tokens"
import { FuncArgButton, FuncArgInput } from "@components/ui/FuncArgButton"
import ReactDropdown from "react-dropdown"

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

const ManageSushi: FC<Props> = ({ id, title, user }) => {
  const [sushiVaultInitialized, setSushiVaultInitialized] = useState()
  const [balance, setBalance] = useState()
  const [totalSupply, setTotalSupply] = useState()
  const [address, setAddress] = useState("0xf8d6e0586b0a20c7")
  const [amount, setAmount] = useState()

  useEffect(() => {
    isSushiVaultInitialized()
    getBalance()
    getTotalSupply()
  }, [user?.addr])

  const setupVault = async () => {
    try {
      const res = await send([
        transaction(SETUP_SUSHI_VAULT),
        payer(authz),
        proposer(authz),
        authorizations([authz]),
        limit(9999),
      ]).then(decode)
      await tx(res).onceSealed()
      isSushiVaultInitialized()
    } catch (err) {
      console.log(err)
    }
  }

  const isSushiVaultInitialized = async () => {
    try {
      let response = await query({
        cadence: IS_SUSHI_VAULT_INITIALIZED,
        args: (arg: any, t: any) => [arg(user?.addr, t.Address)],
      })
      setSushiVaultInitialized(response)
    } catch (err) {
      console.log(err)
    }
  }

  const getBalance = async () => {
    try {
      let response = await query({
        cadence: GET_SUSHI_BALANCE,
        args: (arg: any, t: any) => [arg(user?.addr, t.Address)],
      })
      setBalance(response)
    } catch (err) {
      console.log(err)
    }
  }

  const getTotalSupply = async () => {
    try {
      let response = await query({
        cadence: GET_SUSHI_TOTAL_SUPPLY,
      })
      setTotalSupply(response)
    } catch (err) {
      console.log(err)
    }
  }

  const createNewMinter = async () => {
    try {
      const res = await send([
        transaction(SUSHI_CREATE_NEW_MINTER),
        payer(authz),
        proposer(authz),
        authorizations([authz]),
        limit(9999),
      ]).then(decode)
      await tx(res).onceSealed()
    } catch (err) {
      console.log(err)
    }
  }

  const mintTokens = async () => {
    try {
      const res = await send([
        transaction(SUSHI_MINT_TOKENS),
        args([arg(address, t.Address), arg(amount, t.UFix64)]),
        payer(authz),
        proposer(authz),
        authorizations([authz]),
        limit(9999),
      ]).then(decode)
      await tx(res).onceSealed()
      getBalance()
      getTotalSupply()
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <TestSectionStyles>
      <TestSection id={id} title={title}>
        <h3>Setup Sushi Vault</h3>
        <FuncButton onClick={() => setupVault()}>setupVault()</FuncButton>
        {sushiVaultInitialized ? (
          <TextAlert className="green-text">
            Sushi vault is initialized
          </TextAlert>
        ) : (
          <>
            <TextAlert className="red-text">
              Sushi vault is not initialized
            </TextAlert>
          </>
        )}

        {balance ? (
          <h3>Current User Balance: {parseFloat(balance).toFixed(2)}</h3>
        ) : (
          <></>
        )}
        {totalSupply ? (
          <h3>Total Supply: {parseFloat(totalSupply).toFixed(2)}</h3>
        ) : (
          <></>
        )}
        <ActionItem>
          <FuncButton onClick={() => createNewMinter()}>
            administrator.createNewMinter()
          </FuncButton>
        </ActionItem>
        <ActionItem>
          <Column>
            <h3>Select Address: </h3>
            <ReactDropdown
              options={["0xf8d6e0586b0a20c7", "0x179b6b1cb6755e31"]}
              onChange={(e) => {
                setAddress(e.value)
              }}
              placeholder="0xf8d6e0586b0a20c7"
            />
          </Column>
          <div>Note: add decimals</div>
          <FuncArgInput
            placeholder="100.00"
            type="text"
            onChange={(e: any) => setAmount(e.target.value)}
          />
          <FuncArgButton onClick={() => mintTokens()}>
            minter.mintTokens()
          </FuncArgButton>
        </ActionItem>
      </TestSection>
    </TestSectionStyles>
  )
}

export default ManageSushi
