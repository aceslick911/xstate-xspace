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
  },
  {
    events: {
      START_BEMA: () => ({}),
      CHANGE_TAB: (activeTab: string) => ({ activeTab }),
    },
  },
);

const RootActor = () =>
  RootModel.createMachine(
    {
      id: 'root',
      preserveActionOrder: true,
      context: RootModel.initialContext,
      initial: 'starting',
      states: {
        starting: {
          type: 'parallel',
          states: {
            rootServices: {
              entry: 'notifyStarted',
              states: {
                index: {},
              },
            },
          },
        },
      },
    },
    {
      services: {},
      actions: {
        notifyStarted: (c, e, m) => send(RootModel.events.START_BEMA()),
      },
    },
  );

export const StateMachineInitializer = () => {
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
  return <></>;
};

export const StateMachineProvider = ({ children }) => {
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
