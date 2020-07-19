import {
  createContext,
  createState,
  Component,
  useContext,
  splitProps,
} from "solid-js";
import { spread } from "solid-js/dom";

import match from "regexparam";
import { createBrowserHistory } from "history";

const browser = createBrowserHistory();
const currentRoute = browser.location;
const [routerState, setRouterState] = createState({ currentRoute });

const store = [
  routerState,
  {
    push(path: string) {
      browser.push(path);
    },
  },
] as const;

const RouterContext = createContext(store);

export function useRouter() {
  return useContext(RouterContext);
}

export const Router: Component = (props) => {
  browser.listen(({ location }) => {
    setRouterState("currentRoute", location);
  });

  return () =>
    RouterContext.Provider({ value: store, children: props.children });
};

export const Route: Component<{ path: string }> = (props) => {
  const [router] = useRouter();
  const routeMatcher = match(props.path).pattern;
  const isActiveRoute = () => !!routeMatcher.test(router.currentRoute.pathname);

  return () => (isActiveRoute() ? props.children : false);
};

export type LinkProps = { path: string } & JSX.AnchorHTMLAttributes<
  HTMLAnchorElement
>;

export const Link: Component<LinkProps> = (props) => {
  const [p, ...others] = splitProps(props, ["path"]);
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

function prevent(fn: (event: Event) => any) {
  return (event: Event) => {
    event.preventDefault();
    fn(event);
  };
}
