import { Context } from './ha-common';

export interface AuthData {
  hassUrl: string;
  clientId: string | null;
  expires: number;
  refresh_token: string;
  access_token: string;
  expires_in: number;
}

export interface Auth {
  wsUrl: string;
  accessToken: string;
  expired: boolean;
  data: AuthData;
}

export interface ConnectionOptions {
  setupRetry: number;
  auth?: Auth;
  createSocket: (options: ConnectionOptions) => Promise<WebSocket>;
}

export type ConnectionEventListener = (conn: Connection, eventData?: any) => void;

export type Events = 'ready' | 'disconnected' | 'reconnect-error';

export interface HassEventBase {
  origin: string;
  time_fired: string;
  context: Context;
}

export interface HassEvent extends HassEventBase {
  event_type: string;
  data: { [key: string]: any };
}

export interface MessageBase {
  id?: number;
  type: string;
  [key: string]: any;
}

export interface WebSocketPongResponse extends MessageBase {
  id: number;
  type: 'pong';
}

export interface WebSocketEventResponse extends MessageBase {
  id: number;
  type: 'event';
  event: HassEvent;
}

export interface WebSocketResultResponse<T = any> extends MessageBase {
  id: number;
  type: 'result';
  success: true;
  result: T;
}

export interface WebSocketResultErrorResponse extends MessageBase {
  id: number;
  type: 'result';
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type WebSocketResponse = WebSocketPongResponse | WebSocketEventResponse | WebSocketResultResponse | WebSocketResultErrorResponse;

export type SubscriptionUnsubscribe = () => Promise<void>;

export interface SubscribeEventCommandInFlight<T> {
  resolve: (result?: any) => void;
  reject: (err: any) => void;
  callback: (ev: T) => void;
  subscribe: (() => Promise<SubscriptionUnsubscribe>) | undefined;
  unsubscribe: SubscriptionUnsubscribe;
}

export interface CommandWithAnswerInFlight {
  resolve: (result?: any) => void;
  reject: (err: any) => void;
}

export type CommandInFlight = SubscribeEventCommandInFlight<any> | CommandWithAnswerInFlight;

export interface Connection {
  options: ConnectionOptions;
  commandId: number;
  commands: Map<number, CommandInFlight>;
  eventListeners: Map<string, ConnectionEventListener[]>;
  closeRequested: boolean;
  suspendReconnectPromise?: Promise<void>;
  oldSubscriptions?: Map<number, CommandInFlight>;
  socket?: WebSocket;
  haVersion: string;
  connected: boolean;

  addEventListener(eventType: Events, callback: ConnectionEventListener): void;

  removeEventListener(eventType: Events, callback: ConnectionEventListener): void;

  fireEvent(eventType: Events, eventData?: any): void;

  suspendReconnectUntil(suspendPromise: Promise<void>): void;

  suspend(): void;

  reconnect(force?: boolean): void;

  close(): void;

  subscribeEvents<EventType>(callback: (ev: EventType) => void, eventType?: string): Promise<SubscriptionUnsubscribe>;

  ping(): void;

  sendMessage(message: MessageBase, commandId?: number): void;

  sendMessagePromise<Result>(message: MessageBase): Promise<Result>;

  subscribeMessage<Result>(callback: (result: Result) => void, subscribeMessage: MessageBase, options?: { resubscribe?: boolean }): Promise<SubscriptionUnsubscribe>;
}

export interface HassServiceTarget {
  entity_id?: string | string[];
  device_id?: string | string[];
  area_id?: string | string[];
}
