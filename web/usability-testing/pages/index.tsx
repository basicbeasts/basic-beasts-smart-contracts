import type { NextPage } from "next"
import Head from "next/head"
import styles from "../styles/Home.module.css"
import styled from "styled-components"
import StickySidebar from "@components/ui/StickySidebar"
import Link from "next/link"
import TestSection from "@components/ui/TestSection"
import { useRouter } from "next/router"

// TODO #1: detect element when in viewport to change browser url or state.
// So instead the sidebar items react based on currently viewed div/section

const H1 = styled.h1`
  text-align: center;
  font-size: 3em;
  line-height: 1.5em;
`

const Content = styled.div`
  height: 1600px;
  width: 100vh;
  padding: 10px;
`

const A = styled.a<Omit<PathName, "">>`
  font-size: 1.5em;
  cursor: pointer;
  line-height: 2em;
  text-decoration: ${(props) =>
    "active" === props.pathname ? "underline rgb(99,91,255)" : "none"};
  color: ${(props) =>
    "active" === props.pathname ? "rgb(99,91,255)" : "#000"};
  font-weight: ${(props) => ("active" === props.pathname ? "700" : "normal")};
`

type PathName = {
  pathname: any
}

const Home: NextPage = () => {
  const router = useRouter()

  enum SectionName {
    SECTION_1 = "Setup Account",
    SECTION_2 = "Created Beast Templates",
    SECTION_3 = "View Beast Templates",
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
          </StickySidebar>
          <Content>
            <H1>
              Usability Testing For
              <br />
              Basic Beasts Smart Contracts
            </H1>
            <TestSection id="1" title={SectionName.SECTION_1}>
              Setup Beast Collection
            </TestSection>
            <TestSection id="2" title={SectionName.SECTION_2}>
              s
            </TestSection>
            <TestSection id="3" title={SectionName.SECTION_3}>
              s
            </TestSection>
          </Content>
        </div>
      </main>
    </div>
  )
}

export default Home
