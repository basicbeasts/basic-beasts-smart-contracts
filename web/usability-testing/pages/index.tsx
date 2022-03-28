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
import { useEffect, useState } from "react"
import { useUser } from "@contexts/UserProvider"
import makeData from "makeData"
import SetupAccount from "@components/ui/BasicBeastsSection/SetupAccount"
import CreatedBeastTemplates from "@components/ui/BasicBeastsSection/CreatedBeastTemplates"
import ViewCreateBeastTemplate from "@components/ui/BasicBeastsSection/ViewCreateBeastTemplate"
import OtherAdminFunctions from "@components/ui/BasicBeastsSection/OtherAdminFunctions"

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

  const {
    isBeastCollectionInitialized,
    initializeBeastCollection,
    createBeastTemplate,
    getBeastTemplate,
    beastTemplateData,
    fetchedBeastTemplate,
    getAllBeastTemplateIDs,
    beastTemplateIDs,
  } = useUser()

  useEffect(() => {
    fcl.currentUser.subscribe(setUser)
    getAllBeastTemplateIDs()
  }, [])

  const logIn = () => {
    fcl.authenticate()
  }

  const logOut = () => {
    fcl.unauthenticate()
  }

  const switchAccount = () => {
    fcl.unauthenticate()
    logIn()
  }

  enum SectionName {
    SECTION_1 = "1. Setup Account",
    SECTION_2 = "2. Created Beast Templates",
    SECTION_3 = "3. View & Create Beast Template",
    SECTION_4 = "4. Mint Beast & Batch Mint",
    SECTION_5 = "5. Other Admin Functions",
  }

  const consoleLog = () => {
    // console.log("beastTemplates: " + beastTemplates)
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
            <H2>Egg.cdc (Later)</H2>
            <H2>LovePotion.cdc (Later)</H2>
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
            <SetupAccount
              id={"1"}
              title={SectionName.SECTION_1}
              initializeBeastCollection={initializeBeastCollection}
              isBeastCollectionInitialized={isBeastCollectionInitialized}
              consoleLog={consoleLog}
            />
            <CreatedBeastTemplates
              id={"2"}
              title={SectionName.SECTION_2}
              beastTemplateData={beastTemplateData}
              beastTemplateIDs={beastTemplateIDs}
            />

            <ViewCreateBeastTemplate
              id={"3"}
              title={SectionName.SECTION_3}
              beastTemplateData={beastTemplateData}
              getBeastTemplate={getBeastTemplate}
              createBeastTemplate={createBeastTemplate}
              fetchedBeastTemplate={fetchedBeastTemplate}
            />

            <TestSection id="4" title={SectionName.SECTION_4}>
              M
            </TestSection>

            <OtherAdminFunctions id={"5"} title={SectionName.SECTION_5} />
          </Content>
        </div>
      </main>
    </div>
  )
}

export default Home
