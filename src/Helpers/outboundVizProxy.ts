import { inspect } from '@xstate/inspect/lib/server';
import type { Inspector } from '@xstate/inspect';
import { assign, EventObject, send } from 'xstate';
import { createModel } from 'xstate/lib/model';

const { log } = console;

type DataType = any;

type DataCallback = (msg: DataType) => void;
type TriggerCallback = () => void;

type Client = {
  readyState: number;
  OPEN: number;
  send: DataCallback;
};

type SendMethod = (event: EventObject) => void;

type OutboundProxy = {
  clients: Client[];
  on: (notificationType: string, callback: (...args: any) => any) => void;
};

export const VizOutboundProxyModel = createModel(
  {
    sendMethod: undefined as (event: EventObject) => void,

    outboundProxy: undefined as OutboundProxy,
    clients: undefined as Client[],
    remoteServerSocket: undefined as WebSocket,
    addClient: undefined as (client: Client, onClientReady: () => void) => void,
    xstateClose: undefined as TriggerCallback,

    setXSendMessageToXState: undefined as Setter,
    setxstateClose: undefined as Setter,
  },
  {
    events: {
      START: (sendMethod: SendMethod) => ({ sendMethod }),
      ON_CONNECTION: (callback: (wss: any) => void) => ({ callback }),
      ON_CLOSE: (callback: TriggerCallback) => ({ callback }),
      DO_CLOSE: (xstateClose: TriggerCallback) => ({ xstateClose }),
    },
  },
);

const VizOutboundProxyMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QDUCWAvA8gVwC4CMB7bAOwgAUAnQgDwE8A6VCAGzAGIBlAFQEEAlbolAAHQrFS5UhEsJA1EAWgDMADgBsDZQCZVAVgCMAdgPq9yg3rMAaEHSXKADAYYBObboAs+x9r16NAF9A2zQsPCJSCmp6JhJJVABDFgxUEih2TAA5AH0AYWysgFE87gBJbLkxCSkZOQUEdWUGYwNVZWV1fWVXV0cbOyVtT0cGbUdlTybVIyn1I1VtYNCMHAJiMipaRjSE5NT0zNy8gBlMTiKq8QS6pHlEeYYrDtVXHRN1Odt7BBVXVQY6i6-kc7U8egWemWIDCa0imxijEoYESEDo7AAIph8mcLlcatJZHcGp4em49K51I4RuptKYDG9vg5-gwRgZPAZjGoOnphsEQiASIQIHA5LCIhtotsmKwwPibkTQA0VI8jI49ODOUZPhYjEzfjSnuYDI4jBT-uo2lCBeL1lEtrFdlJ9ug0lB5bVFfdfuzXFpnt4et4PB59YptLTAUZdOyAp5dH1lNDbfCpbFkaifqJrp76ohdKMOk02tHOh49GG6X7DPoI6SJu1OsnVhL7YiPYS8waTVpdIYPsarBXBgajNXjS8KfoAtbgkA */
  VizOutboundProxyModel.createMachine(
    {
      context: VizOutboundProxyModel.initialContext,
      tsTypes: {} as import('./outboundVizProxy.typegen').Typegen0,
      id: 'VizOutboundProxy',
      initial: 'idle',
      states: {
        idle: {
          on: {
            START: {
              actions: ['setup', 'createOutboundProxy'],
              target: '#VizOutboundProxy.initializing',
            },
          },
        },
        initializing: {
          on: {
            ON_CONNECTION: {
              actions: 'onConnection',
              target: '#VizOutboundProxy.ready',
            },
            ON_CLOSE: {
              actions: 'onClose',
              target: '#VizOutboundProxy.initializing',
            },
          },
        },
        ready: {
          on: {
            DO_CLOSE: {
              actions: 'doClose',
              target: '#VizOutboundProxy.ready',
            },
          },
        },
      },
    },
    {
      actions: {
        doClose: (c, e, m) => {
          log('websock closed', c.xstateClose);
          if (c.xstateClose) {
            log('DID CLSOE');
            c.xstateClose();
          }
        },

        onClose: (c, e, m) => {
          log('XSTATE SET closed .', e.type);
          c
            .xstateClose
            //e.callback
            ();
        },

        onConnection: (c, e, m) => {
          log('Promise Resolved');

          const onClientReady = () => {
            const simulatedwss = {
              on: (wssMType, setIncomingCallback) => {
                log('assigning real sender', wssMType, setIncomingCallback);
                c.setXSendMessageToXState(setIncomingCallback);
              },
            };
            e.callback(simulatedwss);
          };

          c.addClient(
            {
              readyState: 1,
              OPEN: 1,
              send: msg => {
                log('Sending to remote server:', msg);
                c.remoteServerSocket.send(msg);
              },
            },
            onClientReady,
          );
        },

        setup: assign({
          sendMethod: (c, e, m) => e.sendMethod,
        }),

        createOutboundProxy: assign({
          outboundProxy: (c, e, m) => {
            const clients = [];
            const { sendMethod } = c;
            return {
              clients,
              on: (listener, callback) => {
                switch (listener) {
                  case 'connection':
                    return sendMethod(
                      VizOutboundProxyModel.events.ON_CONNECTION(callback),
                    );
                  case 'close':
                    return sendMethod(
                      VizOutboundProxyModel.events.ON_CLOSE(callback),
                    );
                }
              },
              close: () => {
                sendMethod(
                  VizOutboundProxyModel.events.DO_CLOSE(c.xstateClose),
                );
              },
            };
          },
        }),
      },
      services: {},
    },
  );

export const VizProxyModel = createModel(
  {
    websocketServerUrl: null as string,

    // Methods
    // listenModeLoopbackWSProxy: null as typeof listenModeLoopbackWSProxy,
    webSocketToRemoteServer: null as typeof webSocketToRemoteServer,

    // Connection instances
    localLoopbackToXState: null as OutboundProxy,
    remoteServerSocket: null as WebSocket,

    inspector: null as Inspector,

    clients: [] as Client[],
    msgQUEUE: [] as DataType[],

    sendMethod: null as (event: EventObject) => void,

    onClose: null as TriggerCallback,

    xstateClose: null as TriggerCallback,
    XSSendReal: null as DataCallback,
    XSend: null as DataCallback,
    XSendMessageToXState: null as DataCallback,

    connectionCallback: null as TriggerCallback,
    closeCallback: null as TriggerCallback,
  },
  {
    events: {
      START: (
        websocketServerUrl: string,
        sendMethod: (event: EventObject) => void,
      ) => ({ websocketServerUrl, sendMethod }),

      INSPECT: () => ({}),
      ADD_CLIENT: (client: Client, clientReadyCallback: () => void) => ({
        client,
        clientReadyCallback,
      }),

      SEND_TO_VIZ: (data: any) => ({ data }),
      SET_CONNECTION_CALLBACK: (connectionCallback: any) => ({
        connectionCallback,
      }),
      SET_CLOSE_CALLBACK: (closeCallback: any) => ({
        closeCallback,
      }),

      SET_SERVER_ONCLOSE_CALLBACK: (closeCallback: any) => ({
        closeCallback,
      }),

      SET_SERVER_XSSendReal_CALLBACK: (callback: any) => ({
        callback,
      }),
      START_REMOTE_CONNECTION: () => ({}),
      SET_SERVER_REMOTE_WS: (remoteServerSocket: WebSocket) => ({
        remoteServerSocket,
      }),

      SET_SERVER_setXSendMessageToXState: (callback: any) => ({
        callback,
      }),
      SEND_MESSAGE_TO_SERVER: (data: any) => ({ data }),
      SEND_MESSAGE_TO_XSTATE: (data: any) => ({ data }),
      WEB_SOCKET_CONNECTED: () => ({}),
    },
  },
);

export const VizProxyMachine =
  /** @xstate-layout N4IgpgJg5mDOIC5QHkCuAXARge1QOwgDUBLALwAUAnbADwE8A6YiAGzAGIBlAFQEEAlbolAAHbLGLpi2PMJA1EAWgAsygOwMAHAGYArADYAnLoAM6gEzLz+gDQg6S3U4Zrzu5Zv2eAjOdfaAXwC7NCxcAhIKanoGSjAAQwg6Lj5BAH1+AFEAWWRuTLSAYWQAORLMwu4ASVK5MQkpGTkFBEVtbUMGZV9vXU0DL00TbTsHBHaTBkNvfXNtNW81PVVlIJCMHHwiMipaRjjE5IB1TIAhNM5kQoBpTO4i0vLKzIAROvFJaVkkeSV25QY3kMJn081M+lcamUo0Q5jhDA62n0II8fW03hM3jWIFCmwiO2i+wSSXYvBeLyKABkqpkSkIfvVPk0fi0VGpdID9EZ9EC3N5NK4Ya04doGHNdMDdGpQcNlMNsbjwtsontYsTkpxaRTuMg0oQqgAtd4NL7NJRAjnedGadSGVSg8yaIWKXkuQxqFFqTQC3xLBUbJWRXYxA4kzUlCnZTKcTi8ADiBR1F0y-EIKeNTO+oFZ7Mm-Pa2htRkMhg6zpm+i6jqBmmmZkLHn9YS2QcJasOXC1aSjMfjid1AA0eLx8hnGlnfq1tHKpmZa+ZfE4TCZdELdL0ppo3LWTEs-P0m3jlcGNXcHmUKtVSkVeJTKadeDcx6aWX9lKKV25DDLpgunfY-iBQE-CRRZ9F0OFv0PQMCT2Tt7k1VMUzSUpCkpZBNRvO8HyfBkPnHM1xkMTQGGRVQDG0YZpRMOYhThStzBXKwvXRPQFmgltYPoeDkyQ-gMhyPICiOThn2ZbNEDlUVQQxEwhi3L12SFbRzE6Xd0StWsgVBLkOPxFVuM1BCUzTfih04MACH4BIWCw+9H2uMSJ1ZTRvABEtdCRJZPP6DxnQFEjukdYYOlcK09OPQl2CqEpOHIS8nMIqxzC6O1HWRdEFi3IVvEWQFXLUfw2NcZRdAi1s4KM3jTLSWAwHQIdLIgbI4FgeIYG4bAh3QeJ0DARLX1adQAWGOtPOI5F3X8oYER5aUvDc5QvFWYIcQDTiDNPe40IwgpClvezcNEfCXwkhBulFAVgSGQwF2-dlbAA86Zw6H0lg6XKBSCVa8GwCA4DkRUNpPJhWH6vCTXEydFGlEjXrcyFxvXZ13BSiVMQMWUrCRcquKJQ4GCBggTwGs6YdMKY3FUkKVP0UqhTUToloWXc7QFOmF1xzb2ySBgADcyAYABjGQ8DAIWpDwKBOusgBbbA+osyg+bAShScndwtH5HkpJUjEDFXJ7pxIldWeIm12ThLmQdDRgBdIBg6vQSWoAAVREET1ZaTXXJ8XWFxXcC6IxBhTcU9Q5LhXxrbbW3+cF2BsCFgBrerClF8W+ogL3EB97W3JCgODboxnQ9MRmvMKt6Y9VOP7aYPBYBETPiClnOEDzv3C-1oOnu6DRTaGSbFkWQJVqJyLa-VeOHfiCXiBV9vO517vA8NsYnA5Qf+VMAx1DK8f1v0m3p-rxOU-ql5iFgEW8DFiXIHbwqtD3HQ7S8Ew7TUIUPErbfIM8FudoNcQynwTknVO6BuDEFlpAUI7dphdDYgKU2qkFw5W6GXXcrlrCFilCCEB+Neb23bpRLWXd2hF17mMLwWD2SmGGJ4Si+hCE8zGMdSGzklCFXclTYEBZrD0yei6SsdpboLDcDySidpCHtxhsRSmEF+GULpuvJQdNJiuHcOBCCVpVDmG+gEIAA */
  VizProxyModel.createMachine(
    {
      context: VizProxyModel.initialContext,
      tsTypes: {} as import('./outboundVizProxy.typegen').Typegen1,
      preserveActionOrder: true,
      id: 'OutboundVizProxy',
      initial: 'idle',
      states: {
        idle: {
          entry: 'initialize',
          on: {
            START: {
              actions: ['setURL', 'startRemoteConnection'],
              target: '#OutboundVizProxy.idle',
            },
          },
        },
        ready: {
          type: 'parallel',
          states: {
            OutboundProxy: {
              entry: 'startOutboundVizProxy',
              invoke: {
                src: 'VizOutboundProxy',
                id: 'VizOutboundProxy',
              },
            },
            viz: {
              states: {
                connectingToRemoteServer: {},
                settingUpWS: {},
                socketConnected: {},
                inspecting: {},
                active: {},
                socketDisconnected: {},
                socketTimedOut: {},
              },
            },
          },
          on: {
            START_REMOTE_CONNECTION: {
              actions: 'startRemoteConnection',
              target: '#OutboundVizProxy.ready.viz.connectingToRemoteServer',
            },
            WEB_SOCKET_CONNECTED: {
              actions: 'socketConnected',
              target: '#OutboundVizProxy.ready.viz.socketConnected',
            },
            ADD_CLIENT: {
              actions: ['addClient', 'initClients'],
              target: '#OutboundVizProxy.ready',
            },
            SEND_TO_VIZ: {
              actions: 'sendToViz',
              target: '#OutboundVizProxy.ready',
            },
            SEND_MESSAGE_TO_SERVER: {
              actions: 'sendMessageToServer',
              target: '#OutboundVizProxy.ready',
            },
            SEND_MESSAGE_TO_XSTATE: {
              actions: 'sendMessageToXState',
              target: '#OutboundVizProxy.ready.viz.active',
            },
          },
        },
      },
      on: {
        SET_CONNECTION_CALLBACK: {
          actions: 'setConnectionCallback',
          target: '#OutboundVizProxy.ready',
        },
        SET_SERVER_ONCLOSE_CALLBACK: {
          actions: 'setServerONCLOSECallBack',
          target: '#OutboundVizProxy.ready.viz.settingUpWS',
        },
        SET_SERVER_REMOTE_WS: {
          actions: 'setRemoteConnection',
          target: '#OutboundVizProxy.ready.viz.connectingToRemoteServer',
        },
        SET_SERVER_XSSendReal_CALLBACK: {
          actions: 'setServerXSSendRealCallBack',
          target: '#OutboundVizProxy',
        },
        INSPECT: {
          actions: 'startServer',
          target: '#OutboundVizProxy.ready.viz.settingUpWS',
        },
        SET_SERVER_setXSendMessageToXState: {
          actions: 'setXSendMessageToXState',
          target: '#OutboundVizProxy',
        },
        SET_CLOSE_CALLBACK: {
          actions: 'setCloseCallback',
          target: '#OutboundVizProxy.ready.viz.inspecting',
        },
      },
    },
    {
      services: {
        VizOutboundProxy: VizOutboundProxyMachine,
      },
      actions: {
        startOutboundVizProxy: (c, e, m) =>
          send(
            VizOutboundProxyModel.events.START(
              m.state.children.VizOutboundProxy.send,
            ),
            { to: 'VizOutboundProxy' },
          ),
        initialize: assign({
          webSocketToRemoteServer: (c, e, m) => webSocketToRemoteServer,
          // listenModeLoopbackWSProxy: (c, e, m) => listenModeLoopbackWSProxy,
        }),

        sendToViz: (c, e, m) => {
          log('Sending data to VIZ', e.data);
          c.XSend(e.data);
        },

        startRemoteConnection: (c, e, m) => {
          log('Creating remote socket', e);

          return c
            .webSocketToRemoteServer({
              websocketServerUrl: c.websocketServerUrl,
              msgQUEUE: c.msgQUEUE,
              relayToXState: data =>
                c.sendMethod(VizProxyModel.events.SEND_MESSAGE_TO_XSTATE(data)),

              setOnClose: OnClose =>
                c.sendMethod(
                  VizProxyModel.events.SET_SERVER_ONCLOSE_CALLBACK(OnClose),
                ),

              setRemoteServerSocket: remoteServerSocket =>
                c.sendMethod(
                  VizProxyModel.events.SET_SERVER_REMOTE_WS(remoteServerSocket),
                ),

              onConnected: () => {
                c.sendMethod(VizProxyModel.events.WEB_SOCKET_CONNECTED());
              },
            })
            .then(ws => {
              log('Remote socket created. Starting inspect sequence', ws);
              c.sendMethod(VizProxyModel.events.INSPECT());
              return ws;
            });
        },

        setRemoteConnection: assign({
          remoteServerSocket: (c, e, m) => e.remoteServerSocket,
        }),

        // startProxy: assign({
        //   localLoopbackToXState: (c, e, m) => {
        //     log('Creating Loopback ProxySocket', e);

        //     return c.listenModeLoopbackWSProxy({
        //       clients: c.clients,
        //       remoteServerSocket: c.remoteServerSocket,

        //       addClient: (newClient, clientReadyCallback) => {
        //         c.clients.push(newClient);
        //         return c.sendMethod(
        //           VizProxyModel.events.ADD_CLIENT(
        //             newClient,
        //             clientReadyCallback,
        //           ),
        //         );
        //       },
        //       xstateClose: c.xstateClose,
        //       setXSendMessageToXState: callback =>
        //         c.sendMethod(
        //           VizProxyModel.events.SET_SERVER_setXSendMessageToXState(
        //             callback,
        //           ),
        //         ),
        //       setxstateClose: closeCallback =>
        //         c.sendMethod(
        //           VizProxyModel.events.SET_CLOSE_CALLBACK(closeCallback),
        //         ),
        //     });
        //   },
        // }),

        setURL: assign({
          websocketServerUrl: (c, e, m) => e.websocketServerUrl,
          sendMethod: (c, e, m) => e.sendMethod,
        }),

        startServer: assign({
          inspector: (c, e, m) => {
            console.log('INSPECTING NOW', c.localLoopbackToXState);

            return inspect({
              server: c.localLoopbackToXState as any,
            });
          },
        }),

        addClient: assign({
          clients: (c, e, m) => [...c.clients, e.client],
        }),

        initClients: (c, e, m) => {
          e.clientReadyCallback();
        },

        setConnectionCallback: assign({
          connectionCallback: (c, e, m) => e.connectionCallback,
        }),

        setCloseCallback: assign({
          closeCallback: (c, e, m) => e.closeCallback,
        }),

        setServerONCLOSECallBack: assign({
          onClose: (c, e, m) => e.closeCallback,
        }),
        setServerXSSendRealCallBack: assign({
          XSendMessageToXState: (c, e, m) => e.callback,
        }),

        setXSendMessageToXState: assign({
          XSendMessageToXState: (c, e, m) => e.callback,
        }),

        sendMessageToServer: (c, e, m) => {
          log('🔌 >>', e.data);
          c.remoteServerSocket.send(e.data);
        },
        sendMessageToXState: (c, e, m) => {
          log('📠', e.data, c.XSendMessageToXState);
          c.XSendMessageToXState(e.data);
        },

        socketConnected: (c, e, m) => {
          log('⚡️🔌 Connected to WebSocket');
        },
      },
    },
  );

type Setter = (value) => void;

// const VizWebsocketRemoteModel = createModel({
//   websocketServerUrl : undefined as string,
//   msgQUEUE : undefined as DataType[],

//   relayToXState : undefined as DataCallback,

//   setOnClose : undefined as Setter,
//   setRemoteServerSocket : undefined as Setter,
//   onConnected : undefined as TriggerCallback,
// },{
//   events:{

//     START:(websocketServerUrl:string, sendMethod: (event: EventObject) => void)=>({websocketServerUrl, sendMethod}),
//   }
// })

// export const VizWebsocketRemoteMachine = VizWebsocketRemoteModel.createMachine({
//   id:'VizWebsocketRemote',
//   context: VizWebsocketRemoteModel.initialContext,

//   initial:'idle',
//   states:{
//     idle:{
//       on:{
//         START:{
//           actions:'createWebsocketConnection',
//           target:'initializing',
//         }
//       }
//     },
//     initializing:{},
//     ready:{},
//   }

// },{
//   services:{},
//   actions:{
// doClose:(c,e,m)=>{
//   log('websock closed', e.xstateClose);

//     log('DID CLSOE');
//   e.xstateClose();
//   }
//     createWebsocketConnection:(c,e,m)=>{
//       const remoteServerSocket = new WebSocket(websocketServerUrl);
//       log(`Connecting to ${websocketServerUrl}`, remoteServerSocket);

//       setOnClose(() => remoteServerSocket.close());

//       setRemoteServerSocket(remoteServerSocket);

//       return new Promise<WebSocket>(resolveSocketReady => {
//         log('Setting up websocket connection to remote..');
//         remoteServerSocket.onopen = () => {
//           log('Remote connected');
//           onConnected();

//           for (const msg of msgQUEUE) {
//             log('REPLAY', msg);
//             relayToXState(msg);
//           }

//           resolveSocketReady(remoteServerSocket);
//         };
//         remoteServerSocket.onmessage = e => {
//           log('🔌 <<', e.data);
//           relayToXState(e.data);
//         };
//       });
//     }
//   }
// })

const webSocketToRemoteServer = ({
  websocketServerUrl = undefined as string,
  msgQUEUE = undefined as DataType[],

  relayToXState = undefined as DataCallback,

  setOnClose = undefined as Setter,
  setRemoteServerSocket = undefined as Setter,
  onConnected = undefined as TriggerCallback,
}) => {
  const remoteServerSocket = new WebSocket(websocketServerUrl);
  log(`Connecting to ${websocketServerUrl}`, remoteServerSocket);

  setOnClose(() => remoteServerSocket.close());

  setRemoteServerSocket(remoteServerSocket);

  return new Promise<WebSocket>(resolveSocketReady => {
    log('Setting up websocket connection to remote..');
    remoteServerSocket.onopen = () => {
      log('Remote connected');
      onConnected();

      for (const msg of msgQUEUE) {
        log('REPLAY', msg);
        relayToXState(msg);
      }

      resolveSocketReady(remoteServerSocket);
    };
    remoteServerSocket.onmessage = e => {
      log('🔌 <<', e.data);
      relayToXState(e.data);
    };
  });
};

/*

    */
/*
(notif, secondParam) => {
          log('⚽️ ON', notif, secondParam);
          switch (notif) {
            case 'connection':
              log('Promise Resolved');
    
              const onClientReady = () => {
                const simulatedwss = {
                  on: (wssMType, setIncomingCallback) => {
                    log('assigning real sender', wssMType, setIncomingCallback);
                    setXSendMessageToXState(setIncomingCallback);
                  },
                };
                secondParam(simulatedwss);
              };
              addClient(
                {
                  readyState: 1,
                  OPEN: 1,
                  send: msg => {
                    log('Sending to remote server:', msg);
                    remoteServerSocket.send(msg);
                  },
                },
                onClientReady,
              );
    
              return;
    
            case 'close': {
              log('XSTATE SET closed .', notif);
              setxstateClose(secondParam);
            }
          }
        },
*/

const listenModeLoopbackWSProxy = ({
  clients = undefined as Client[],
  remoteServerSocket = undefined as WebSocket,
  addClient = undefined as (client: Client, onClientReady: () => void) => void,
  xstateClose = undefined as TriggerCallback,
  setXSendMessageToXState = undefined as Setter,
  setxstateClose = undefined as Setter,
}) => {
  return {
    clients,
    on: (notif, secondParam) => {
      log('⚽️ ON', notif, secondParam);
      switch (notif) {
        case 'connection':
          log('Promise Resolved');

          const onClientReady = () => {
            const simulatedwss = {
              on: (wssMType, setIncomingCallback) => {
                log('assigning real sender', wssMType, setIncomingCallback);
                setXSendMessageToXState(setIncomingCallback);
              },
            };
            secondParam(simulatedwss);
          };
          addClient(
            {
              readyState: 1,
              OPEN: 1,
              send: msg => {
                log('Sending to remote server:', msg);
                remoteServerSocket.send(msg);
              },
            },
            onClientReady,
          );

          return;

        case 'close': {
          log('XSTATE SET closed .', notif);
          setxstateClose(secondParam);
        }
      }
    },
    close: () => {
      log('websock closed', xstateClose);
      if (xstateClose) {
        log('DID CLSOE');
        xstateClose();
      }
    },
  };
};
