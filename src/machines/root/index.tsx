import React, { createContext, useContext, useEffect } from 'react';
import {
  ActorRef,
  assign,
  createMachine,
  interpret,
  Interpreter,
  send,
  State,
  StateMachine,
} from 'xstate';
import { useMachine } from '@xstate/react';
import { createModel } from 'xstate/lib/model';
import { Model } from 'xstate/lib/model.types';
import { AnyState, SendType } from '../../types';
import { initializeXStateLogger, log } from '../../Helpers/logging';
import { testMachine } from '../test';
import { TestComponent } from '../test/components/test';

// import { InPlayMachine } from '../../InPlay';

type RootProps = {
  children?: any;
  service?: any;
  send?: SendType;
  state?: AnyState;
};

const defaultContext = {
  children: undefined as any | undefined,
  service: undefined as undefined | any,
  send: ((event: string) => {}) as SendType | undefined,
  state: undefined as AnyState | undefined,
} as RootProps;

export const StateMachineContext = createContext(defaultContext);

export const StateMachineContextConsumer = StateMachineContext.Consumer;

export const RootModel = createModel(
  {
    state: undefined as AnyState | undefined,
    inPlayMachine: undefined as { machine; model; state; send; service },

    activeMachine: undefined as any,
  },
  {
    events: {
      START_BEMA: () => ({}),
      CHANGE_TAB: (activeTab: string) => ({ activeTab }),
      START_TEST_MACHINE: () => ({}),
    },
  },
);

const machineList = [[{ testMachine }, { Component: TestComponent }]];

const machineNames = machineList.map(ob => Object.keys(ob[0])[0]);
const machineValues = machineNames
  .map((name, index) => ({
    name,
    machine: machineList[index][0],
    data: machineList[index][1],
  }))
  .reduce(
    (prev, curr) => ({
      ...(prev || {}),
      [curr.name]: curr,
    }),
    {},
  );

const machineStates = machineNames
  .map(machine => ({
    [machine]: {
      invoke: {
        id: machine,
        src: machineValues[machine].machine,
        onDone: '#start',
      },
    },
  }))
  .reduce((prev, curr) => ({ ...(prev || {}), ...curr }), {});

const machineTriggers = machineNames
  .map(machine => ({
    [`START_${machine.replace('Machine', '_MACHINE').toUpperCase()}`]: {
      actions: 'activateMachine',
      target: `.#start.rootServices.${machine}`,
    },
  }))
  .reduce((prev, curr) => ({ ...(prev || {}), ...curr }), {});

export const eventToMachineMap = machineNames
  .map(machine => ({
    [`START_${machine.replace('Machine', '_MACHINE').toUpperCase()}`]:
      machineValues[machine],
  }))
  .reduce((prev, curr) => ({ ...(prev || {}), ...curr }), {});

console.log({ machineStates, machineTriggers, eventToMachineMap });

const RootActor = () =>
  RootModel.createMachine(
    {
      id: 'root',
      preserveActionOrder: true,
      context: RootModel.initialContext,
      initial: 'start',
      states: {
        start: {
          id: 'start',
          type: 'parallel',
          states: {
            rootServices: {
              entry: 'notifyStarted',
              on: {
                // ...machineTriggers,
                START_TEST_MACHINE: {
                  actions: 'activateMachine',
                  target: '.#start.rootServices.testMachine',
                },
              },
              states: {
                //...machineStates,
                testMachine: {
                  invoke: {
                    id: 'testMachine',
                    src: testMachine,
                    onDone: '#start',
                  },
                },
              },
            },
          },
        },
      },
    },
    {
      services: {},
      actions: {
        activateMachine: assign({
          activeMachine: (c, e, m) => {
            const machine = e.type;
            return machine;
          },
        }),
        notifyStarted: (c, e, m) => send(RootModel.events.START_BEMA()),
      },
    },
  );

export const StateMachineInitializer = ({ children }) => {
  const { service, send } = useContext(StateMachineContext);

  useEffect(() => {
    initializeXStateLogger((...args) =>
      send({
        type: 'LOG',
        msg: JSON.stringify(args, null, 4),
      }),
    );
    log('Logger initialized');
  }, []);
  return <>{children}</>;
};

export const StateMachineProvider = ({ children }) => {
  console.log('PROVIDER');
  const [state, send, service] = useMachine(() => RootActor(), {
    devTools: true,
  });

  useEffect(() => {
    console.log('STARTED ROOT', { state, send, service });

    const sub = service.subscribe(state => {
      const top = state.value;
      console.log('=', JSON.stringify(top), state.value);
    });
    return sub.unsubscribe;
  }, [service]);

  return (
    <StateMachineContext.Provider value={{ service, send, state }}>
      {children}
    </StateMachineContext.Provider>
  );
};
