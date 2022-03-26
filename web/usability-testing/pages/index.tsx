import type { NextPage } from "next"
import Head from "next/head"
import styles from "../styles/Home.module.css"
import styled from "styled-components"
import StickySidebar from "@components/ui/StickySidebar"
import Link from "next/link"
import TestSection from "@components/ui/TestSection"
import { useRouter } from "next/router"
import Image from "next/image"
import logo from "../public/Basic_Beast_Logo_Round.png"
import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
import { useEffect, useMemo, useState } from "react"
import useLogin from "@hooks/useLogin"
import { useUser } from "@contexts/UserProvider"
import Table from "@components/ui/Table"
import makeData from "makeData"
import beastTemplates2 from "data/beastTemplates"
import BeastCard from "@components/ui/BeastCard"

// TODO #1: detect element when in viewport to change browser url or state.
// So instead the sidebar items react based on currently viewed div/section

// TODO #2: Make accordians

const H1 = styled.h1`
  text-align: center;
  font-size: 3em;
  line-height: 1.5em;
`

const Content = styled.div`
  height: 1600px;
  width: 100vh;
  padding: 10px;
  margin-top: 40px;
`

const ImageWrapper = styled.div`
  display: flex;
  justify-content: center;
`

const H2 = styled.h2`
  margin: 10px 0;
`

const H3 = styled.h3`
  font-size: 1.5em;
`

const A = styled.a<Omit<PathName, "">>`
  font-size: 1.2em;
  cursor: pointer;
  line-height: 2em;
  text-decoration: ${(props) =>
    "active" === props.pathname ? "underline rgb(99,91,255)" : "none"};
  color: ${(props) =>
    "active" === props.pathname ? "rgb(99,91,255)" : "#000"};
  font-weight: ${(props) => ("active" === props.pathname ? "700" : "normal")};
`

const Span = styled.span`
  font-size: 1.5em;
  line-height: 2em;
`

const Button = styled.button`
  background: #222;
  color: #fff;
  border: none;
  font-size: 15px;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    background: #000000;
  }
`

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

const FuncButton = styled.button`
  background: transparent;
  border: 1px solid #222;
  color: #222;
  font-size: 15px;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    background: #000000;
    color: #fff;
  }
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

const TableStyles = styled.div`
  padding: 1rem;
  color: #2c3042;
  table {
    border-spacing: 0;
    /* border: 1px solid black; */

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      margin: 0;
      padding: 0.5rem;
      border-bottom: 1px solid #eaeaea;
      /* border-right: 1px solid black; */

      :last-child {
        border-right: 0;
      }
    }
  }
  .pagination {
    padding: 0.5rem;
  }
`

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

const RedText = styled.div`
  font-size: 1.5em;
  color: red;
`

const GreenText = styled.div`
  font-size: 1.5em;
  color: green;
`

type PathName = {
  pathname: any
}

fcl
  .config()
  .put("app.detail.title", "Basic Beasts")
  .put("app.detail.icon", "https://i.imgur.com/LihLjpF.png")
  .put("accessNode.api", "http://localhost:8080") // Emulator
  .put("discovery.wallet", "http://localhost:8701/fcl/authn")
  .put("0xBasicBeasts", "0xf8d6e0586b0a20c7")
  .put("0xNonFungibleToken", "0xf8d6e0586b0a20c7")
//.put("accessNode.api", process.env.NEXT_PUBLIC_ACCESS_NODE_API)
//.put("challenge.handshake", process.env.NEXT_PUBLIC_CHALLENGE_HANDSHAKE)
//.put("0xFungibleToken", process.env.NEXT_PUBLIC_FUNGIBLE_TOKEN_ADDRESS)
//.put("0xFUSD", process.env.NEXT_PUBLIC_FUSD_ADDRESS)

const Home: NextPage = () => {
  const router = useRouter()
  const [user, setUser] = useState({ addr: "" })
  const [generation, setGeneration] = useState()
  const [beastTemplateID, setBeastTemplateID] = useState()
  const [beastTemplate, setBeastTemplate] = useState()
  const [beastTemplateCreated, setBeastTemplateCreated] = useState()

  const {
    isBeastCollectionInitialized,
    initializeBeastCollection,
    beastTemplates,
    getAllBeastTemplates,
    createBeastTemplate,
    beastTemplateData,
  } = useUser()

  useEffect(() => {
    fcl.currentUser.subscribe(setUser)
    getCurrentGeneration() // Runs currentGeneration getter on start of app
    data
  }, [])

  const logIn = useLogin()

  const logOut = () => {
    fcl.unauthenticate()
  }

  const switchAccount = () => {
    fcl.unauthenticate()
    logIn()
  }

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

    console.log({ txId })
    getCurrentGeneration() // Runs currentGeneration getter script
  }

  enum SectionName {
    SECTION_1 = "1. Setup Account",
    SECTION_2 = "2. Created Beast Templates",
    SECTION_3 = "3. View & Create Beast Templates",
    SECTION_4 = "4. Mint Beast & Batch Mint",
    SECTION_5 = "5. Other Admin Functions",
  }

  const columns = useMemo(
    () => [
      {
        Header: "Beast Templates",
        columns: [
          {
            Header: "beastTemplateID",
            accessor: "beastTemplateID",
          },
          {
            Header: "dexNumber",
            accessor: "dexNumber",
          },
          {
            Header: "name",
            accessor: "name",
          },
          {
            Header: "description",
            accessor: "description",
          },
          {
            Header: "image",
            accessor: "image",
          },
          {
            Header: "imageTransparentBg",
            accessor: "imageTransparentBg",
          },
          {
            Header: "animationUrl",
            accessor: "animationUrl",
          },
          {
            Header: "externalUrl",
            accessor: "externalUrl",
          },
          {
            Header: "rarity",
            accessor: "rarity",
          },
          {
            Header: "skin",
            accessor: "skin",
          },
          {
            Header: "starLevel",
            accessor: "starLevel",
          },
          {
            Header: "asexual",
            accessor: "asexual",
          },
          {
            Header: "breedableBeastTemplateID",
            accessor: "breedableBeastTemplateID",
          },
          {
            Header: "maxAdminMintAllowed",
            accessor: "maxAdminMintAllowed",
          },
          {
            Header: "ultimateSkill",
            accessor: "ultimateSkill",
          },
          {
            Header: "basicSkills",
            accessor: "basicSkills",
          },
          {
            Header: "elements",
            accessor: "elements",
          },
        ],
      },
    ],
    [],
  )

  const data = useMemo(() => beastTemplates, [])

  const getBeastTemplate = () => {
    // console.log("beastTemplateID2: " + beastTemplateID)
    setBeastTemplate(beastTemplates2[beastTemplateID])
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

  const consoleLog = () => {
    console.log(beastTemplates)
  }

  return (
    <div className={styles.container}>
      <Head>
        <title>Basic Beasts Usability Testing</title>
        <meta
          name="description"
          content="Frontend for usability testing of smart contracts"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <div style={{ display: "flex", alignItems: "flex-start" }}>
          <StickySidebar>
            {user.addr ? (
              <>
                {user.addr == "0xf8d6e0586b0a20c7"
                  ? "Admin Account: "
                  : "User Account: "}
                <Span>{user.addr}</Span>
                <Button onClick={switchAccount}>Switch Account</Button>
                <br />
                <Button onClick={logOut}>Log Out</Button>
              </>
            ) : (
              <>
                <Button onClick={logIn}>Log In</Button>
              </>
            )}
            <br />
            <H2>BasicBeasts.cdc</H2>
            <Link href="#1" passHref>
              <A pathname={router.asPath == "/#1" ? "active" : ""}>
                {SectionName.SECTION_1}
              </A>
            </Link>
            <Link href="#2" passHref>
              <A pathname={router.asPath == "/#2" ? "active" : ""}>
                {SectionName.SECTION_2}
              </A>
            </Link>
            <Link href="#3" passHref>
              <A pathname={router.asPath == "/#3" ? "active" : ""}>
                {SectionName.SECTION_3}
              </A>
            </Link>
            <Link href="#4" passHref>
              <A pathname={router.asPath == "/#4" ? "active" : ""}>
                {SectionName.SECTION_4}
              </A>
            </Link>
            <Link href="#5" passHref>
              <A pathname={router.asPath == "/#5" ? "active" : ""}>
                {SectionName.SECTION_5}
              </A>
            </Link>
            <H2>Evolution.cdc</H2>
            <H2>HunterScore.cdc</H2>
            <H2>Breeding.cdc</H2>
            <H2>Pack.cdc</H2>
          </StickySidebar>
          <Content>
            <ImageWrapper>
              <Image
                src={logo}
                alt="Basic Beasts Logo"
                width={120}
                height={120}
              />
            </ImageWrapper>
            <H1>
              Usability Testing For
              <br />
              Basic Beasts Smart Contracts
            </H1>

            <TestSection id="1" title={SectionName.SECTION_1}>
              <H3>Setup Beast Collection</H3>
              <FuncButton onClick={() => initializeBeastCollection()}>
                <span>createEmptyCollection()</span>
              </FuncButton>
              <br />
              <br />
              {isBeastCollectionInitialized ? (
                <GreenText>Collection is initialized</GreenText>
              ) : (
                <>
                  <RedText>Collection is not initialized</RedText>
                </>
              )}
              <br />
              <FuncButton onClick={() => consoleLog()}>
                <span>console.log button</span>
              </FuncButton>
            </TestSection>

            <TestSection id="2" title={SectionName.SECTION_2}>
              {/* <FuncButton onClick={() => console.log(getAllBeastTemplates())}>
                getAllBeastTemplates()
              </FuncButton> */}
              <H3>getAllBeastTemplates()</H3>
              {beastTemplateData != null ? (
                <TableStyles>
                  <Table columns={columns} data={beastTemplateData} />
                </TableStyles>
              ) : (
                <></>
              )}
            </TestSection>

            <TestSection id="3" title={SectionName.SECTION_3}>
              <br />
              {beastTemplateData != null ? (
                <>
                  <TestWrapper>
                    <div>
                      <FuncArgInput
                        placeholder="beastTemplateID"
                        type="text"
                        onChange={(e) => setBeastTemplateID(e.target.value)}
                      />
                      <FuncArgButton onClick={() => getBeastTemplate()}>
                        Search
                      </FuncArgButton>
                      <br />
                      <br />
                      {beastTemplateCreated == true ? (
                        <GreenText>beastTemplateCreated = true</GreenText>
                      ) : (
                        <>
                          {beastTemplateCreated == false ? (
                            <RedText>beastTemplateCreated = false</RedText>
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

                  {beastTemplate != null &&
                  //TODO: This beastTemplates[beastTemplate.beastTemplateID - 1] does not work. We need to fetch the specific on-chain beast template from bb.cdc getter function
                  beastTemplates[beastTemplate.beastTemplateID - 1] != null ? (
                    <>
                      <div>Comparison data.ts vs on-chain</div>
                      <div>
                        name: {beastTemplate.name} |{" "}
                        {beastTemplates[beastTemplate.beastTemplateID - 1].name}
                      </div>
                    </>
                  ) : (
                    <></>
                  )}
                </>
              ) : (
                <>
                  {" "}
                  <FuncButton
                    onClick={() => createBeastTemplate(beastTemplateID)}
                  >
                    <span>adminRef.createBeastTemplate(...)</span>
                  </FuncButton>
                </>
              )}
            </TestSection>

            <TestSection id="4" title={SectionName.SECTION_4}>
              s
            </TestSection>

            <TestSection id="5" title={SectionName.SECTION_5}>
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

              <br />
              <FuncButton>
                <span>adminRef.createNewAdmin()</span>
              </FuncButton>
            </TestSection>
          </Content>
        </div>
      </main>
    </div>
  )
}

export default Home
