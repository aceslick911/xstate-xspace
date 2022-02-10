import { createModel } from 'xstate/lib/model';

export const testModel = createModel(
  {
    message: 'Hello' as string,
  },
  {
    events: {
      SAY_HELLO_BACK: () => ({}),
    },
  },
);

export const testMachine = testModel.createMachine({
  id: 'TestMachine',
  tsTypes: {} as import('./index.typegen').Typegen0,
  initial: 'start',
  states: {
    start: {
      on: {
        SAY_HELLO_BACK: 'stepTwo',
      },
    },
    stepTwo: {},
    stepThree: {},
    finish: {
      type: 'final',
    },
  },
});
