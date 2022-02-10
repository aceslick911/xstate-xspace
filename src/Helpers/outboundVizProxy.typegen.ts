// This file was automatically generated. Edits will be overwritten

export interface Typegen0 {
  '@@xstate/typegen': true;
  eventsCausingActions: {
    setup: 'START';
    createOutboundProxy: 'START';
    onConnection: 'ON_CONNECTION';
    onClose: 'ON_CLOSE';
    doClose: 'DO_CLOSE';
  };
  internalEvents: {
    'xstate.init': { type: 'xstate.init' };
  };
  invokeSrcNameMap: {};
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {};
  eventsCausingGuards: {};
  eventsCausingDelays: {};
  matchesStates: 'idle' | 'initializing' | 'ready';
  tags: never;
}
export interface Typegen1 {
  '@@xstate/typegen': true;
  eventsCausingActions: {
    setConnectionCallback: 'SET_CONNECTION_CALLBACK';
    setServerONCLOSECallBack: 'SET_SERVER_ONCLOSE_CALLBACK';
    setRemoteConnection: 'SET_SERVER_REMOTE_WS';
    setServerXSSendRealCallBack: 'SET_SERVER_XSSendReal_CALLBACK';
    startServer: 'INSPECT';
    setXSendMessageToXState: 'SET_SERVER_setXSendMessageToXState';
    setCloseCallback: 'SET_CLOSE_CALLBACK';
    setURL: 'START';
    startRemoteConnection: 'START' | 'START_REMOTE_CONNECTION';
    socketConnected: 'WEB_SOCKET_CONNECTED';
    addClient: 'ADD_CLIENT';
    initClients: 'ADD_CLIENT';
    sendToViz: 'SEND_TO_VIZ';
    sendMessageToServer: 'SEND_MESSAGE_TO_SERVER';
    sendMessageToXState: 'SEND_MESSAGE_TO_XSTATE';
    initialize: 'START';
    startOutboundVizProxy: 'xstate.init';
  };
  internalEvents: {
    'xstate.init': { type: 'xstate.init' };
    'done.invoke.VizOutboundProxy': {
      type: 'done.invoke.VizOutboundProxy';
      data: unknown;
      __tip: 'See the XState TS docs to learn how to strongly type this.';
    };
    'error.platform.VizOutboundProxy': {
      type: 'error.platform.VizOutboundProxy';
      data: unknown;
    };
  };
  invokeSrcNameMap: {
    VizOutboundProxy: 'done.invoke.VizOutboundProxy';
  };
  missingImplementations: {
    actions: never;
    services: never;
    guards: never;
    delays: never;
  };
  eventsCausingServices: {
    VizOutboundProxy: 'xstate.init';
  };
  eventsCausingGuards: {};
  eventsCausingDelays: {};
  matchesStates:
    | 'idle'
    | 'ready'
    | 'ready.OutboundProxy'
    | 'ready.viz'
    | 'ready.viz.connectingToRemoteServer'
    | 'ready.viz.settingUpWS'
    | 'ready.viz.socketConnected'
    | 'ready.viz.inspecting'
    | 'ready.viz.active'
    | 'ready.viz.socketDisconnected'
    | 'ready.viz.socketTimedOut'
    | {
        ready?:
          | 'OutboundProxy'
          | 'viz'
          | {
              viz?:
                | 'connectingToRemoteServer'
                | 'settingUpWS'
                | 'socketConnected'
                | 'inspecting'
                | 'active'
                | 'socketDisconnected'
                | 'socketTimedOut';
            };
      };
  tags: never;
}
