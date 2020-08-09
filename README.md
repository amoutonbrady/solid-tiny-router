# Solid Tiny Router

Experimental and personal tiny little router based on [history](https://github.com/ReactTraining/history) & [regexparam](https://github.com/lukeed/regexparam) for [solid](https://github.com/ryansolid/solid)

## Quick start

Install it:

```bash
pnpm add @amoutonbrady/solid-tiny-router
```

Use it:

```tsx
import { Component, lazy } from 'solid-js';
import { useAuth } from './fake-auth.ts';
// Minimal exports
import { Router, Route, Link, useRouter, Redirect } from './router';

// It can work with lazy routes
const Home = lazy(() => import('./Home'));

const App: Component = () => {
  // Minimal API
  const [auth] = useAuth();
  const [router, { push }] = useRouter();

  return (
    <Router>
      {/* This is a reactive URL Object, you can retrieve searchParams, pathname & hash from it */}
      <p>{router.currentRoute.pathname}</p>

      {/* Link */}
      <Link path="/" class="text-blue-700" active-class="underline">Home</Link>
      <Link path="/about">About</Link>
      <button onClick={(_) => push('/')}>Navigate without a link</button>
      <hr />

      {/* Routes, pretty much just a wrapper around <Show> that display the content only if the route match the path your provide */}
      <Route path="/" children={Home} />
      <Route path="/about">
        <p>Sweet about</p>
      </Route>
      <Route path="/user/:id">This the user {router.params.id}<Route>

      {/* This is how you'd add a guard to authenticated only routes */}
      <Show when={auth.isLoggedIn()}>
        <Route path="/admin">Admin route</Route>
        <Redirect path="/login" to="/admin" />
      </Show>

      {/* Catch all route */}
      <Route path="*">404 not found</Route>
      {/* You can also do that if you want to retrive the url */}
      <Route path=":url">{router.params.url} not found</Route>
    </Router>
  );
};

export default App;
```
