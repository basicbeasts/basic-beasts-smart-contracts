import { FC } from "react"
import styled from "styled-components"

const Container = styled.button`
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

type Props = {
  onClick: any
}

const FuncButton: FC<Props> = ({ onClick, children }) => {
  return <Container onClick={() => onClick()}>{children}</Container>
}

export default FuncButton
