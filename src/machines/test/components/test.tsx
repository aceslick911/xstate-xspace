import { useActor, useMachine } from '@xstate/react';
import React, { useContext } from 'react';
import { StateMachineContext } from '../../root';

export const TestComponent = () => {
  const { service } = useContext(StateMachineContext);
  console.log('SERVICE', service);
  const testMachine = service.children.get('testMachine');
  console.log({ testMachine });

  // const [state, send] = useActor(testMachine as any);
  //{JSON.stringify(state, null, 4)}
  return <div>{'HI'}</div>;
};
