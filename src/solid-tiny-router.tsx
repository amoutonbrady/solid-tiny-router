import {
  createContext,
  createState,
  Component,
  useContext,
  splitProps,
  createEffect,
  State,
} from 'solid-js';
import { Match, Switch } from 'solid-js/dom';
import match from 'regexparam';

import { createHistory } from './history';

// ---
// STATE
// ---

const createRouter = () => {
  const browser = createHistory();
  const currentRoute = browser.location;

  const [routerState, setRouterState] = createState<RouterState>({
    currentRoute,
    params: {},
    routes: {},
  });

  const store = [
    routerState,
    {
      push: (path: string) => browser.push(path),
      setParams: (params: Record<string, any>) => setRouterState({ params }),
    },
  ] as const;

  browser.listen((currentRoute) => setRouterState({ currentRoute }));

  return store;
};

type TState = ReturnType<typeof createRouter>;

const RouterContext = createContext<TState>();

// ---
// HOOKS
// ---

export function useRouter() {
  return useContext(RouterContext);
}

// ---
// COMPONENTS
// ---

export const Router: Component<{}> = (props) => {
  const store = createRouter();

  return (
    <RouterContext.Provider value={store}>
      <Switch>{props.children}</Switch>
    </RouterContext.Provider>
  );
};

export const Route: Component<{ path: string }> = (props) => {
  const [router, { setParams }] = useRouter();

  const isActiveRoute = () => {
    const url = normalizePath(router.currentRoute);
    const matcher = match(props.path);
    const isActive = matcher.pattern.test(url);
    const params = exec(url, matcher);
    setParams(params);
    return isActive;
  };

  return <Match when={isActiveRoute()}>{props.children}</Match>;
};

export const Redirect: Component<{ path: string; to: string }> = (props) => {
  const [router, { push }] = useRouter();

  const isActiveRoute = () => {
    const url = normalizePath(router.currentRoute);
    const matcher = match(props.path);
    const isActive = matcher.pattern.test(url);
    return isActive;
  };

  createEffect(() => {
    if (isActiveRoute()) push(props.to);
  });

  return false;
};

export const Link: Component<LinkProps> = (props) => {
  const [internal, external] = splitProps(props, ['path', 'active-class']);
  const [router, { push }] = useRouter();

  const handleClick = () => push(internal.path);
  const activeClass = () => {
    const url = normalizePath(router.currentRoute);
    const matcher = match(props.path);
    const isActive = matcher.pattern.test(url);
    return internal['active-class'] ? { [internal['active-class']]: isActive } : {};
  };

  return (
    <a {...external} href={internal.path} onClick={prevent(handleClick)} classList={activeClass()}>
      {props.children}
    </a>
  );
};

// ---
// HELPERS FUNCTIONS
// ---

export function prevent(fn: (event: Event) => any) {
  return (event: Event) => {
    event.preventDefault();
    fn(event);
  };
}

// Adapted from here: https://github.com/lukeed/regexparam#usage
function exec(path: string, result: RouteMatcher) {
  let i = 0;
  const out: Record<string, string | null> = {};
  const matches = result.pattern.exec(path);
  if (!result.keys || !matches) return {};

  while (i < result.keys.length) {
    out[result.keys[i]] = matches[++i] || null;
  }

  return out;
}

function normalizePath(route: State<URL>): string {
  return route.href.replace(route.origin, '');
}

// ---
// TYPES
// ---

export interface LinkProps extends JSX.AnchorHTMLAttributes<HTMLAnchorElement> {
  path: string;
  'active-class'?: string;
}

export type RouteMatcher = OverloadedReturnType<typeof match>;

export interface RouterState {
  currentRoute: URL;
  routes: Record<string, RouteMatcher>;
  params: Record<string, string | null>;
}

// Utility types from: https://stackoverflow.com/a/52761156
// prettier-ignore
type OverloadedReturnType<T> = 
    T extends { (...args: any[]) : infer R; (...args: any[]) : infer R; (...args: any[]) : infer R ; (...args: any[]) : infer R } ? R  :
    T extends { (...args: any[]) : infer R; (...args: any[]) : infer R; (...args: any[]) : infer R } ? R  :
    T extends { (...args: any[]) : infer R; (...args: any[]) : infer R } ? R  :
    T extends (...args: any[]) => infer R ? R : any
