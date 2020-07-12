import match from "regexparam";
import {
  createContext,
  createState,
  Component,
  useContext,
  Show,
  createRoot,
} from "solid-js";
import { createBrowserHistory } from "history";

const router = createRoot(() => {
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

  function useRouter() {
    return useContext(RouterContext);
  }

  const Router: Component = (props) => {
    browser.listen(({ location }) => {
      setRouterState("currentRoute", location);
    });

    return (
      <RouterContext.Provider value={store}>
        {props.children}
      </RouterContext.Provider>
    );
  };

  const Route: Component<{ path: string }> = (props) => {
    const [router] = useRouter();
    const routeMatcher = match(props.path).pattern;
    const isActiveRoute = () =>
      !!routeMatcher.test(router.currentRoute.pathname);

    return <Show when={isActiveRoute()}>{props.children}</Show>;
  };

  const Link: Component<{ path: string }> = (props) => {
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

  return { useRouter, Router, Route, Link };
});

export const useRouter = router.useRouter;
export const Router = router.Router;
export const Route = router.Route;
export const Link = router.Link;
