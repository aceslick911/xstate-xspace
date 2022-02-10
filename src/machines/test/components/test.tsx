import { useMachine } from '@xstate/react';
import React, { useContext } from 'react';
import { StateMachineContext } from '../../root';

export const TestComponent = ({}) => {
  const { service } = useContext(StateMachineContext);
  const { testMachine } = service.children;

  const [state, send, serv] = useMachine(testMachine, { devTools: true });

  return <div>{JSON.stringify(state, null, 4)}</div>;
};
