import match from "regexparam";
import {
  createContext,
  createState,
  Component,
  useContext,
  Show,
} from "solid-js";
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

  return (
    <RouterContext.Provider value={store}>
      {props.children}
    </RouterContext.Provider>
  );
};

export const Route: Component<{ path: string }> = (props) => {
  const [router] = useRouter();
  const routeMatcher = match(props.path).pattern;
  const isActiveRoute = () => !!routeMatcher.test(router.currentRoute.pathname);

  return <Show when={isActiveRoute()}>{props.children}</Show>;
};

export const Link: Component<{ path: string }> = (props) => {
  const [_, { push }] = useRouter();
  const handleClick = () => push(props.path);

  return (
    <a href={props.path} onClick={prevent(handleClick)}>
      {props.children}
    </a>
  );
};

function prevent(fn: (event: Event) => any) {
  return (event: Event) => {
    event.preventDefault();
    fn(event);
  };
}
