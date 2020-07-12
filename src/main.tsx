import {
  createContext,
  createState,
  Component,
  useContext,
  Show,
} from "solid-js";

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

export const Link: Component<{ path: string }> = ({ path, children }) => {
  const [_, { push }] = useRouter();
  const handleClick = () => push(path);

  return (
    <a href={path} onClick={prevent(handleClick)}>
      {children}
    </a>
  );
};

function prevent(fn: (event: Event) => any) {
  return (event: Event) => {
    event.preventDefault();
    fn(event);
  };
}
