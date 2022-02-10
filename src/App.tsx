import React, { useRef, useEffect } from 'react';
import './App.css';

import styled from 'styled-components';
import { RootContainer } from './machines/root/components/container';
import { StateMachineInitializer, StateMachineProvider } from './machines/root';
import { inspect } from '@xstate/inspect';

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

  display: flex;
  flex-direction: columns;

  overflow: hidden;
`;

const Viz = styled.iframe`
  flex: 1 0 100ch;
  border: 1px solid red;
`;

function App() {
  const vizRef = useRef();

  useEffect(() => {
    const viz = vizRef.current;
    if (viz) {
      console.log('VIZZ', viz);
      inspect({
        iframe: viz,

        url: 'https://stately.ai/viz?inspect',
      });
    }
  }, [vizRef]);
  return (
    <AppContainer>
      <LeftCont className="left">
        <StateMachineInitializer vizReady={vizRef.current !== undefined}>
          <StateMachineProvider>
            <RootContainer />
          </StateMachineProvider>
        </StateMachineInitializer>
      </LeftCont>
      <RightCont className="right">
        <Viz ref={vizRef} id="viz" title="viz" />
      </RightCont>
    </AppContainer>
  );
}

export default App;
