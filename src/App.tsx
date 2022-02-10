import React from 'react';
import './App.css';

import styled from 'styled-components';

const Title = styled.h1`
  font-size: 1.5em;
  text-align: center;
  color: palevioletred;
`;

const AppContainer = styled.div`
  display: flex;
  flex: 1 0;
  flex-direction: row;
  height: 100vh;
`;

const LeftCont = styled.div`
  flex: 1 0;
  border: 1px solid yellow;
`;

const RightCont = styled.div`
  flex: 1 0;
  border: 1px solid green;
`;

function App() {
  return (
    <AppContainer>
      <LeftCont className="left" />
      <RightCont className="right" />
    </AppContainer>
  );
}

export default App;
