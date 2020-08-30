import {
  createContext,
  createState,
  Component,
  useContext,
  splitProps,
  createEffect,
  State,
} from 'solid-js';
import { Match } from 'solid-js/dom';
import match from 'regexparam';

import { createHistory } from './history';

// ---
// STATE
// ---

const createRouter = (initialRoute?: string) => {
  const browser = createHistory(initialRoute);
  const currentRoute = browser.location;

  const [routerState, setRouterState] = createState<RouterState>({
    currentRoute,
    params: {},
    query: computeSearchParams(currentRoute),
  });

  const store = [
    routerState,
    {
      push: (path: string) => browser.push(path),
      setParams: (params: Record<string, any>) => setRouterState({ params }),
    },
  ] as const;

  browser.listen((currentRoute) =>
    setRouterState({
      currentRoute,
      query: computeSearchParams(currentRoute),
    }),
  );

  return store;
};

const RouterContext = createContext<RouterContextState>();

// ---
// HOOKS
// ---

export function useRouter() {
  return useContext(RouterContext);
}

// ---
// COMPONENTS
// ---

export const RouterProvider: Component<{ initialRoute?: string }> = (props) => {
  const store = createRouter(props.initialRoute);

  return <RouterContext.Provider value={store}>{props.children}</RouterContext.Provider>;
};

export const Route: Component<{ path: string }> = (props) => {
  const [_, { setParams }] = useRouter();
  const isActiveRoute = () => {
    const { isActive, params } = determineActiveRoute(props.path);
    setParams(params);
    return isActive;
  };

  return <Match when={isActiveRoute()}>{props.children}</Match>;
};

export const Redirect: Component<{ path: string; to: string }> = (props) => {
  const [_, { push }] = useRouter();
  const isActiveRoute = () => determineActiveRoute(props.path).isActive;

  createEffect(() => isActiveRoute() && push(props.to));

  return <Match when={isActiveRoute()}>{false}</Match>;
};

export const Link: Component<LinkProps> = (props) => {
  const [internal, external] = splitProps(props, ['path', 'active-class']);
  const [_, { push }] = useRouter();

  const handleClick = () => push(internal.path);
  const activeClass = () => {
    const { isActive } = determineActiveRoute(props.path);
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

function determineActiveRoute(path: string) {
  const [router] = useRouter();

  const url = normalizePath(router.currentRoute);
  const matcher = match(path);
  const isActive = matcher.pattern.test(url);
  const params = exec(url, matcher);

  return { isActive, params };
}

function computeSearchParams(url: URL): Record<string, string> {
  return Object.fromEntries(url.searchParams.entries());
}

// ---
// TYPES
// ---

export type RouterContextState = ReturnType<typeof createRouter>;

export interface LinkProps extends JSX.AnchorHTMLAttributes<HTMLAnchorElement> {
  path: string;
  'active-class'?: string;
}

export type RouteMatcher = OverloadedReturnType<typeof match>;

export interface RouterState {
  currentRoute: URL;
  params: Record<string, string | null>;
  query: Record<string, string>;
}

// Utility types from: https://stackoverflow.com/a/52761156
// prettier-ignore
type OverloadedReturnType<T> = 
      T extends { (...args: any[]) : infer R; (...args: any[]) : infer R; (...args: any[]) : infer R ; (...args: any[]) : infer R } ? R  :
      T extends { (...args: any[]) : infer R; (...args: any[]) : infer R; (...args: any[]) : infer R } ? R  :
      T extends { (...args: any[]) : infer R; (...args: any[]) : infer R } ? R  :
      T extends (...args: any[]) => infer R ? R : any
