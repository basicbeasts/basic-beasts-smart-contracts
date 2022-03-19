import { FC } from "react"
import styled from "styled-components"

const Container = styled.div`
  margin-top: 100px;
`

const H2 = styled.h2`
  font-size: 2em;
`

const Divider = styled.hr`
  border-top: 1px solid rgb(235, 238, 241);
`

type Props = {
  id: any
  title: String
}

const TestSection: FC<Props> = ({ id, title, children }) => {
  return (
    <Container id={id}>
      <H2>{title}</H2>
      <Divider />
      {children}
    </Container>
  )
}

export default TestSection
