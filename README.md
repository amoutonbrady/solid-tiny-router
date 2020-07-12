# Solid Tiny Router

Experimental and personal tiny little router based on [history](https://github.com/ReactTraining/history) & [regexparam](https://github.com/lukeed/regexparam) for [solid](https://github.com/ryansolid/solid)

## Quick start

Install it:

```bash
pnpm add @amoutonbrady/solid-tiny-router
```

Use it:

```tsx
import { Component, lazy } from "solid-js";
// Minimal exports
import { Router, Route, Link, useRouter } from "./router";

// It can work with lazy routes
const Home = lazy(() => import("./Home"));

const App: Component = () => {
    // Minimal API
  const [router, { push }] = useRouter();

  return (
    <Router>
      {/* Router children should be a single element, if you want many, use a Fragment <> */}
      <>
        <p>{router.currentRoute.pathname}</p> {/* <- This is reactive */}

        {/* Link */}
        <Link path="/">Home</Link>
        <Link path="/about">About</Link>
        <button onClick={(_) => push("/")}>Navigate without a link</button>

        <hr />

        {/* Routes, pretty much just a wrapper around <Show> that display the content only if the route match the path your provide */}
        <Route path="/" children={Home} />
        <Route path="/about">
          <p>Sweet about</p>
        </Route>
      </>
    </Router>
  );
};

export default App;
```