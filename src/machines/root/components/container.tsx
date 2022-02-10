import { useMachine } from '@xstate/react';
import React, { useContext } from 'react';
import { StateMachineContext } from '..';

export const RootContainer = ({}) => {
  const { state } = useContext(StateMachineContext);

  // const [state, send, serv] = useMachine(service, { devTools: true });

  return <div>{JSON.stringify(state, null, 4)}</div>;
};
