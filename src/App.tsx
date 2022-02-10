import React, { useRef, useEffect, useCallback, useState } from 'react';
import './App.css';
import 'react-reflex/styles.css';

import styled from 'styled-components';
import { RootContainer } from './machines/root/components/container';
import { StateMachineInitializer, StateMachineProvider } from './machines/root';
import { inspect } from '@xstate/inspect';

import { ReflexContainer, ReflexSplitter, ReflexElement } from 'react-reflex';

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
  /* border: 1px solid yellow; */
  height: 100vh;
`;

const RightCont = styled.div`
  flex: 1 0;
  /* border: 1px solid green; */

  display: flex;
  flex-direction: columns;

  overflow: hidden;
  height: 100vh;
`;

// const Resizer = styled(ReflexSplitter)`
//   background-color: orange;
// `;

const Viz = styled.iframe`
  flex: 1 0 100ch;
  border: 1px solid red;
`;

function App() {
  const vizRef = useRef();

  const [vizReady, setVizReady] = useState(false);

  const firstRun = useCallback(() => {
    const timer = setInterval(() => {
      let viz = vizRef.current as HTMLElement;
      console.log('CHECK', viz);
      if (viz) {
        console.log('VIZZ running', viz);

        const iframe = viz as HTMLIFrameElement; //.children[0]

        console.log(viz, iframe);
        inspect({
          iframe,

          url: 'https://stately.ai/viz?inspect',
        });
        console.log('DONEEE');
        setVizReady(true);
        clearInterval(timer);
      }
    }, 100);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    firstRun();
  }, []);

  return (
    <AppContainer>
      <ReflexContainer orientation="vertical" windowResizeAware={true}>
        <ReflexElement className="left-pane">
          <LeftCont className="left">
            {vizReady === false ? (
              <div>{'Loading viz...'}</div>
            ) : (
              <StateMachineInitializer>
                <StateMachineProvider>
                  <RootContainer />
                </StateMachineProvider>
              </StateMachineInitializer>
            )}
          </LeftCont>
        </ReflexElement>
        <ReflexSplitter />
        <ReflexElement className="right-pane">
          <RightCont className="right">
            <Viz ref={vizRef} id="viz" title="viz" />
          </RightCont>
        </ReflexElement>
      </ReflexContainer>
    </AppContainer>
  );
}

export default App;
