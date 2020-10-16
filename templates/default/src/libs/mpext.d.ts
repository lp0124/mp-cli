type IAnyObject = Record<string, unknown>

interface State {
  [props: string]: unknown
}

interface Action {
  type: string
  [extraProps: string]: unknown
}

type Dispatch<A extends Action = Action> = (action: A) => A

type Unsubscribe = () => void

interface Store {
  getState: () => State
  dispatch: Dispatch
  subscribe: (listener: () => void) => Unsubscribe
}

interface Provider {
  store: Store
  namespace?: string
  manual?: boolean
}

type MapState = (string | ((state: State) => IAnyObject))[]

type ActionCreator<A extends Action = Action> = (...args: unknown[]) => A

type MapDispatchObject = Record<string, ActionCreator>
type MapDispatchFunction = (dispatch: Dispatch) => Record<string, Function>
type MapDispatch = MapDispatchObject | MapDispatchFunction

interface Config {
  mapState?: MapState
  mapDispatch?: MapDispatch
  manual?: boolean
}

type SubscribeHandler = (currState: State, prevState: State) => void

type Selector<V> = (state: IAnyObject) => V
type Ref<V> = { readonly value: V }

interface Mpext {
  setProvider(provider: Provider): void
  $page(config?: Config): WechatMiniprogram.Page.Constructor
  $component(config?: Config): WechatMiniprogram.Component.Constructor
  useStore(): Store
  useState(): State
  useDispatch(): Dispatch
  useSubscribe(handler: SubscribeHandler): Unsubscribe
  useRef<V = unknown>(selector: Selector<V>): Ref<V>
}

declare const mpext: Mpext

export = mpext
