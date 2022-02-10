import { log } from './logging';

export const WSReverse = ({ server }) =>
  new Promise((resolveAllDone, reject) => {
    const clients = [];

    // log('Waiting for XState to initiate');

    const events = {
      clients,
      // connection: null,
      onClose: null,
      xstateClose: null,
      XSSendReal: null,
      XSend: null,

      XSimulateConnectionMade: null,
      XSendMessageToXState: null,
      msgQUEUE: [],
      wsCreator: () => {
        const ws = new WebSocket(server);
        log(`Connecting to ${server}`);

        events.onClose = () => ws.close();

        return new Promise<void>((resolveSocketReady, reject) => {
          ws.onopen = () => {
            log('CONNECTED');

            events.XSSendReal = data => {
              // log('Sending to Xs..', data);
              if (events.XSendMessageToXState) {
                events.XSendMessageToXState(data);
              }
            };
            events.ws = ws;
            resolveSocketReady();
            for (const msg of events.msgQUEUE) {
              // log('REPLAY', msg);
              events.XSSendReal(msg);
            }
            events.XSend = events.XSSendReal;
          };
          ws.onmessage = e => {
            // log('SOCKET received: %s', e.data);
            events.XSend(e.data);
          };
        });
      },
      ws: null,
    };

    events.XSend = msg => {
      log('XMSG queued', msg);
      events.msgQUEUE.push(msg);
    };

    const proxy = {
      clients,
      on: (notif, secondParam) => {
        // log(notif, secondParam);
        switch (notif) {
          case 'connection':
            // log('XSTATE connect', notif);
            events.wsCreator().then(ready => {
              // log('REMOTE READY');
              events.clients.push({
                readyState: 1,
                OPEN: 1,
                send: msg => {
                  events.ws.send(msg);
                },
              });
              const simulatedwss = {
                on: (wssMType, setIncomingCallback) => {
                  // log('assigning real sender', wssMType);
                  events.XSendMessageToXState = setIncomingCallback;
                },
              };
              events.XSimulateConnectionMade = () => secondParam(simulatedwss);
              // log('Starting...');
              events.XSimulateConnectionMade();
            });

            return;

          case 'close': {
            // log('XSTATE SET closed .', notif);
            events.xstateClose = secondParam;
          }
        }
      },
      close: () => {
        log('websock closed', events.xstateClose);
        if (events.xstateClose) {
          // log('DID CLSOE');
          events.xstateClose();
        }
      },
    };

    resolveAllDone(proxy);
  });

//Usage:

// const { inspect } = require('@xstate/inspect/lib/server');
// WSReverse({
// server: 'wss://xstate-viz-socks.herokuapp.com',
// }).then((server) =>
//   inspect({
//     server,
//   })
// );
