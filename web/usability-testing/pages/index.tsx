import type { NextPage } from "next"
import Head from "next/head"
import styles from "../styles/Home.module.css"
import styled from "styled-components"
import StickySidebar from "@components/ui/StickySidebar"
import Link from "next/link"
import { useRouter } from "next/router"
import Image from "next/image"
import logo from "../public/Basic_Beast_Logo_Round.png"
import * as fcl from "@onflow/fcl"
import * as t from "@onflow/types"
import { useEffect, useState } from "react"
import { useUser } from "@contexts/UserProvider"
import SetupAccount from "@components/ui/BasicBeastsSection/SetupAccount"
import CreatedBeastTemplates from "@components/ui/BasicBeastsSection/CreatedBeastTemplates"
import ViewCreateBeastTemplate from "@components/ui/BasicBeastsSection/ViewCreateBeastTemplate"
import OtherAdminFunctions from "@components/ui/BasicBeastsSection/OtherAdminFunctions"
import MintBeast from "@components/ui/BasicBeastsSection/MintBeast"
import ViewBeastCollections from "@components/ui/BasicBeastsSection/ViewBeastCollections"
import BeastInteractions from "@components/ui/BasicBeastsSection/BeastInteractions"
import PrepareEvolution from "@components/ui/EvolutionSection/PrepareEvolution"
import EvolveBeasts from "@components/ui/EvolutionSection/EvolveBeasts"
import AdminEvolveBeasts from "@components/ui/EvolutionSection/AdminEvolveBeasts"
import OtherEvolutionAdminFunctions from "@components/ui/EvolutionSection/OtherEvolutionAdminFunctions"
import HunterScore from "@components/ui/HunterScoreSection/HunterScore"
import HunterScoreAdminFunctions from "@components/ui/HunterScoreSection/HunterScoreAdminFunctions"
import ManageSushi from "@components/ui/SushiSection/ManageSushi"
import ManageEmptyPotionBottle from "@components/ui/EmptyPotionBottleSection/ManageEmptyPotionBottle"
import ManagePoop from "@components/ui/PoopSection/ManagePoop"
import SetupPackCollection from "@components/ui/PackSection/SetupPackCollection"
import CreatedPackTemplates from "@components/ui/PackSection/CreatedPackTemplates"
import CreateAllPackTemplates from "@components/ui/PackSection/CreateAllPackTemplates"
import MintPacks from "@components/ui/PackSection/MintPacks"
import ViewPackCollections from "@components/ui/PackSection/ViewPackCollections"
import PackInteractions from "@components/ui/PackSection/PackInteractions"

// TODO #2: Make accordians

const Sidebar = styled.div`
  position: fixed;
  height: 100%;
  background-color: #fff;
  top: 0;
  left: 0;
  width: 20vw;
  display: flex;
  flex-direction: column;
  padding: 70px 30px 30px;

  overflow: hidden;
  overflow-y: scroll;

  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
  &::-webkit-scrollbar {
    display: none;
  }
`

const H1 = styled.h1`
  text-align: center;
  font-size: 3em;
  line-height: 1.5em;
`

const Content = styled.div`
  /* height: 1600px; */
  width: 100vh;
  padding: 10px 0;
  margin: 40px 0;
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
  .put("0xMetadataViews", "0xf8d6e0586b0a20c7")
  .put("0xEvolution", "0xf8d6e0586b0a20c7")
  .put("0xHunterScore", "0xf8d6e0586b0a20c7")
  .put("0xSushi", "0xf8d6e0586b0a20c7")
  .put("0xFungibleToken", "0xf8d6e0586b0a20c7")
  .put("0xEmptyPotionBottle", "0xf8d6e0586b0a20c7")
  .put("0xPoop", "0xf8d6e0586b0a20c7")
  .put("0xPack", "0xf8d6e0586b0a20c7")
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
    SECTION_5 = "5. View Beast Collections",
    SECTION_6 = "6. Beast Interactions",
    SECTION_7 = "7. Other Admin Functions",
    SECTION_8 = "8. Prepare Evolution",
    SECTION_9 = "9. Evolve Beasts",
    SECTION_10 = "10. Admin Evolve Beasts",
    SECTION_11 = "11. Other Admin Functions",
    SECTION_12 = "12. Hunter Score ",
    SECTION_13 = "13. Admin Hunter Score Functions ",
    SECTION_14 = "14. Manage Sushi",
    SECTION_15 = "15. Manage EPB",
    SECTION_16 = "16. Manage Poop",
    SECTION_17 = "17. Setup Pack Collection",
    SECTION_18 = "18. Create All Pack Templates",
    SECTION_19 = "19. Mint Packs",
    SECTION_20 = "20. View Pack Collections",
    SECTION_21 = "21. Pack Interactions",
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
      <Sidebar>
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
        <Link href="#6" passHref>
          <A pathname={router.asPath == "/#6" ? "active" : ""}>
            {SectionName.SECTION_6}
          </A>
        </Link>
        <Link href="#7" passHref>
          <A pathname={router.asPath == "/#7" ? "active" : ""}>
            {SectionName.SECTION_7}
          </A>
        </Link>
        <H2>Evolution.cdc</H2>
        <Link href="#8" passHref>
          <A pathname={router.asPath == "/#8" ? "active" : ""}>
            {SectionName.SECTION_8}
          </A>
        </Link>
        <Link href="#9" passHref>
          <A pathname={router.asPath == "/#9" ? "active" : ""}>
            {SectionName.SECTION_9}
          </A>
        </Link>
        <Link href="#10" passHref>
          <A pathname={router.asPath == "/#10" ? "active" : ""}>
            {SectionName.SECTION_10}
          </A>
        </Link>
        <Link href="#11" passHref>
          <A pathname={router.asPath == "/#11" ? "active" : ""}>
            {SectionName.SECTION_11}
          </A>
        </Link>
        <H2>HunterScore.cdc</H2>
        <Link href="#12" passHref>
          <A pathname={router.asPath == "/#12" ? "active" : ""}>
            {SectionName.SECTION_12}
          </A>
        </Link>
        <Link href="#13" passHref>
          <A pathname={router.asPath == "/#13" ? "active" : ""}>
            {SectionName.SECTION_13}
          </A>
        </Link>
        <H2>Sushi.cdc</H2>
        <Link href="#14" passHref>
          <A pathname={router.asPath == "/#14" ? "active" : ""}>
            {SectionName.SECTION_14}
          </A>
        </Link>
        <H2>EmptyPotionBottle.cdc</H2>
        <Link href="#15" passHref>
          <A pathname={router.asPath == "/#15" ? "active" : ""}>
            {SectionName.SECTION_15}
          </A>
        </Link>
        <H2>Poop.cdc</H2>
        <Link href="#16" passHref>
          <A pathname={router.asPath == "/#16" ? "active" : ""}>
            {SectionName.SECTION_16}
          </A>
        </Link>
        <H2>Pack.cdc</H2>
        <Link href="#17" passHref>
          <A pathname={router.asPath == "/#17" ? "active" : ""}>
            {SectionName.SECTION_17}
          </A>
        </Link>
        <Link href="#18" passHref>
          <A pathname={router.asPath == "/#18" ? "active" : ""}>
            {SectionName.SECTION_18}
          </A>
        </Link>
        <Link href="#19" passHref>
          <A pathname={router.asPath == "/#19" ? "active" : ""}>
            {SectionName.SECTION_19}
          </A>
        </Link>
        <Link href="#20" passHref>
          <A pathname={router.asPath == "/#20" ? "active" : ""}>
            {SectionName.SECTION_20}
          </A>
        </Link>
        <Link href="#21" passHref>
          <A pathname={router.asPath == "/#21" ? "active" : ""}>
            {SectionName.SECTION_21}
          </A>
        </Link>
        <H2>Breeding.cdc (Later)</H2>
        <H2>Egg.cdc (Later)</H2>
        <H2>LovePotion.cdc (Later)</H2>
      </Sidebar>
      <main>
        <div
          className={styles.container}
          style={{ display: "flex", alignItems: "flex-start" }}
        >
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
            <MintBeast id={"4"} title={SectionName.SECTION_4} />
            <ViewBeastCollections
              id={"5"}
              title={SectionName.SECTION_5}
              user={user}
            />
            <BeastInteractions
              id={"6"}
              title={SectionName.SECTION_6}
              user={user}
            />
            <OtherAdminFunctions id={"7"} title={SectionName.SECTION_7} />
            <PrepareEvolution
              id={"8"}
              title={SectionName.SECTION_8}
              user={user}
            />
            <EvolveBeasts id={"9"} title={SectionName.SECTION_9} user={user} />
            <AdminEvolveBeasts
              id={"10"}
              title={SectionName.SECTION_10}
              user={user}
            />
            <OtherEvolutionAdminFunctions
              id={"11"}
              title={SectionName.SECTION_11}
              user={user}
            />
            <HunterScore id={"12"} title={SectionName.SECTION_12} />
            <HunterScoreAdminFunctions
              id={"13"}
              title={SectionName.SECTION_13}
            />
            <ManageSushi id={"14"} title={SectionName.SECTION_14} user={user} />
            <ManageEmptyPotionBottle
              id={"15"}
              title={SectionName.SECTION_15}
              user={user}
            />
            <ManagePoop id={"16"} title={SectionName.SECTION_16} user={user} />
            <SetupPackCollection
              id={"17"}
              title={SectionName.SECTION_17}
              user={user}
            />{" "}
            <CreateAllPackTemplates id={"18"} title={SectionName.SECTION_18} />
            <MintPacks id={"19"} title={SectionName.SECTION_19} user={user} />
            <ViewPackCollections id={"20"} title={SectionName.SECTION_20} />
            <PackInteractions
              id={"21"}
              title={SectionName.SECTION_21}
              user={user}
            />
          </Content>
        </div>
      </main>
    </div>
  )
}

export default Home
