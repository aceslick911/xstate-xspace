export type SendType =
  | ((event: string | object) => void)
  | ((name: string | object, event?: object) => void);

export type AnyStateMachine = StateMachine<any, any, any>;

export type StateFrom<T> = T extends StateMachine<
  infer TContext,
  any,
  infer TEvent
>
  ? State<TContext, TEvent>
  : T extends Model<infer TContext, infer TEvent>
  ? State<TContext, TEvent, any, any>
  : never;

export type AnyState = State<any, any>;

export type EmbedContext =
  | { isEmbedded: false }
  | ({ isEmbedded: true; originalUrl: string } & ParsedEmbed);
