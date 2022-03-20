import { FC } from "react"
import StickyBox from "react-sticky-box"
import styled from "styled-components"

const Container = styled(StickyBox)`
  width: 20vw;
  display: flex;
  flex-direction: column;
`

const StickySidebar: FC = ({ children }) => {
  return <Container offsetTop={100}>{children}</Container>
}

export default StickySidebar
