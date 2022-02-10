import React from "react";
import logo from "./logo.svg";
import "./App.css";

import styled from "styled-components";

const Title = styled.h1`
  font-size: 1.5em;
  text-align: center;
  color: palevioletred;
`;

function App() {
  return (
    <div className="App">
      <Title>XState XSpace Playground</Title>
      <div className="left"></div>
      <div className="right"></div>
    </div>
  );
}

export default App;
