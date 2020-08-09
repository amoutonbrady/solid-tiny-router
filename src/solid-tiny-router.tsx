import {
  createContext,
  createState,
  Component,
  useContext,
  splitProps,
  unwrap,
  createEffect,
} from 'solid-js';
import { spread } from 'solid-js/dom';
import match from 'regexparam';

import { createHistory } from './history';

// ---
// STATE
// ---

const browser = createHistory();
const currentRoute = browser.location;

const [routerState, setRouterState] = createState<RouterState>({
  currentRoute,
  active: '',
  params: {},
  routes: new Map(),
});

const store = [
  routerState,
  {
    push: (path: string) => {
      browser.push(path);
    },
    addRoute(path: string, matcher: RouteMatcher) {
      setRouterState((state) => {
        state.routes.set(path, matcher);
      });
      const { active, params } = findActive(
        unwrap(routerState.currentRoute),
        unwrap(routerState.routes),
      );
      setRouterState({ active, params });
    },
  },
] as const;

const RouterContext = createContext(store);

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
  browser.listen((currentRoute) => {
    const { active, params } = findActive(currentRoute, unwrap(routerState.routes));
    setRouterState({ currentRoute, active, params });
  });

  return () => RouterContext.Provider({ value: store, children: props.children });
};

export const Route: Component<{ path: string }> = (props) => {
  const [router, { addRoute }] = useRouter();
  addRoute(normalizePath(props.path), match(normalizePath(props.path)));

  const isActiveRoute = () => normalizePath(props.path) === router.active;

  return () => (isActiveRoute() ? props.children : false);
};

export const Redirect = (props: { path: string; to: string }) => {
  const [router, { push }] = useRouter();

  const isActiveRoute = () => normalizePath(props.path) === router.active;

  createEffect(() => {
    if (isActiveRoute()) push(normalizePath(props.to));
  });
};

export const Link: Component<LinkProps> = (props) => {
  const [p, others] = splitProps(props, ['path']);
  const [router, { push }] = useRouter();
  const handleClick = () => push(p.path);

  const isActiveLink = () => normalizePath(p.path) === router.active;

  return () => {
    const activeClass = props['active-class'] ? { [props['active-class']]: isActiveLink() } : {};

    const el = (
      <a href={normalizePath(p.path)} onClick={prevent(handleClick)} classList={activeClass}>
        {props.children}
      </a>
    );

    spread(el as Element, others);

    return el;
  };
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

function findActive(currentRoute: URL, routes: Map<string, RouteMatcher>) {
  for (const [route, matcher] of routes.entries()) {
    const doesMatch = !!matcher.pattern.test(currentRoute.pathname);

    if (doesMatch) {
      const params = exec(currentRoute.pathname, matcher);
      return { active: route, params };
    }
  }

  return { active: 'NOT_FOUND', params: {} };
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

function normalizePath(path: string) {
  return path.startsWith('/') ? path.slice(1) : path;
}

// ---
// TYPES
// ---

export type LinkProps = {
  path: string;
  'active-class'?: string;
} & JSX.AnchorHTMLAttributes<HTMLAnchorElement>;

export type RouteMatcher = OverloadedReturnType<typeof match>;

export interface RouterState {
  currentRoute: URL;
  routes: Map<string, RouteMatcher>;
  params: Record<string, string | null>;
  active: string;
}

// Utility types from: https://stackoverflow.com/a/52761156
// prettier-ignore
type OverloadedReturnType<T> = 
    T extends { (...args: any[]) : infer R; (...args: any[]) : infer R; (...args: any[]) : infer R ; (...args: any[]) : infer R } ? R  :
    T extends { (...args: any[]) : infer R; (...args: any[]) : infer R; (...args: any[]) : infer R } ? R  :
    T extends { (...args: any[]) : infer R; (...args: any[]) : infer R } ? R  :
    T extends (...args: any[]) => infer R ? R : any
