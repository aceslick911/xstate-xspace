import { useMachine } from '@xstate/react';
import React, { useContext, useEffect, useState } from 'react';
import { eventToMachineMap, StateMachineContext } from '..';

import Editor from '@monaco-editor/react';
import { TestComponent } from '../../test/components/test';

export const RootContainer = ({}) => {
  const { state } = useContext(StateMachineContext);

  // const [state, send, serv] = useMachine(service, { devTools: true });

  const [ActiveMachine, setActiveMachine] = useState();
  useEffect(() => {
    if (state.context?.activeMachine !== undefined) {
      console.log('SET 1', state.context.activeMachine);
      const { data } = eventToMachineMap[state.context.activeMachine];
      console.log('SET 2', data);
      const component = data?.Component as any;
      console.log('SET ACTIVE', component);
      setTimeout(() => {
        setActiveMachine(component);
      });
    }
  }, [state.context.activeMachine]);

  const Component = ActiveMachine as React.FC<any>;

  return (
    <div>
      <Editor
        height="48vh"
        defaultLanguage="json"
        theme="vs-dark"
        value={JSON.stringify(
          {
            state: state.value,
            context: state.context,
            lastEvent: state.event,
          },
          null,
          4,
        )}
      />
      {
        ActiveMachine ? <Component /> : <div>NAH</div>
        //(       <TestComponent />)
      }
    </div>
  );
};
