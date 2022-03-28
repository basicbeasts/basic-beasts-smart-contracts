import styled from "styled-components"

export const FuncArgButton = styled.button`
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

export const FuncArgInput = styled.input`
  background: transparent;
  border: 1px solid #222;
  color: #222;
  font-size: 15px;
  padding: 10px 0px 10px 20px;
  border-radius: 8px 0 0 8px;
  width: 150px;
  cursor: pointer;
  margin-right: -1px;
`
