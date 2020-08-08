import {
  createContext,
  createState,
  Component,
  useContext,
  splitProps,
  createEffect,
} from "solid-js";
import { spread } from "solid-js/dom";

import match from "regexparam";
import { createHistory } from "./history";

const browser = createHistory();
const currentRoute = browser.location;
const [routerState, setRouterState] = createState<{
  currentRoute: URL;
  params: Record<string, string | null>;
}>({ currentRoute, params: {} });

const store = [
  routerState,
  {
    push: (path: string) => browser.push(path),
    setParams: (params: Record<string, string | null>) =>
      setRouterState("params", params),
  },
] as const;

const RouterContext = createContext(store);

export function useRouter() {
  return useContext(RouterContext);
}

export const Router: Component = (props) => {
  browser.listen((url) => setRouterState("currentRoute", url));

  return () =>
    RouterContext.Provider({ value: store, children: props.children });
};

export const Route: Component<{ path: string }> = (props) => {
  const [router, { setParams }] = useRouter();
  const routeMatcher = match(props.path);
  const isActiveRoute = () =>
    !!routeMatcher.pattern.test(router.currentRoute.pathname);

  createEffect(() => {
    if (!isActiveRoute()) return;
    const params = exec(props.path, routeMatcher);
    if (params) setParams(params);
  });

  return () => (isActiveRoute() ? props.children : false);
};

export type LinkProps = { path: string } & JSX.AnchorHTMLAttributes<
  HTMLAnchorElement
>;

export const Link: Component<LinkProps> = (props) => {
  const [p, others] = splitProps(props, ["path"]);
  const [_, { push }] = useRouter();
  const handleClick = () => push(p.path);

  return () => {
    const el = (
      <a href={p.path} onClick={prevent(handleClick)}>
        {props.children}
      </a>
    );

    spread(el as Element, others);

    return el;
  };
};

// HELPERS
function prevent(fn: (event: Event) => any) {
  return (event: Event) => {
    event.preventDefault();
    fn(event);
  };
}

// Adapted from here: https://github.com/lukeed/regexparam#usage
function exec(path: string, result: OverloadedReturnType<typeof match>) {
  let i = 0;
  const out: Record<string, string | null> = {};
  const matches = result.pattern.exec(path);
  if (!result.keys || !matches) return {};

  while (i < result.keys.length) {
    out[result.keys[i]] = matches[++i] || null;
  }

  return out;
}

// Utility types from: https://stackoverflow.com/a/52761156
// prettier-ignore
type OverloadedReturnType<T> = 
    T extends { (...args: any[]) : infer R; (...args: any[]) : infer R; (...args: any[]) : infer R ; (...args: any[]) : infer R } ? R  :
    T extends { (...args: any[]) : infer R; (...args: any[]) : infer R; (...args: any[]) : infer R } ? R  :
    T extends { (...args: any[]) : infer R; (...args: any[]) : infer R } ? R  :
    T extends (...args: any[]) => infer R ? R : any
