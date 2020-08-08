import { Component, createSignal } from 'solid-js'
import { Router, Route, Link, useRouter } from '@amoutonbrady/solid-tiny-router'

const App: Component = () => {
  const [router] = useRouter()
  const [count, setCount] = createSignal(0)

  return (
    <div>
      <button onClick={() => setCount(count() + 1)}>{count()}</button>
      <Router>
        <pre>
          <code>{JSON.stringify(router.routes, null, 4)}</code>
        </pre>

        <Link path="">Go gome</Link>
        <Link path="about">Go about</Link>
        <Link path="products/148">Go Product</Link>
        <Link path="where_the_fuck">Go gadget</Link>

        <hr />

        <Route path="">Hello Home</Route>
        <Route path="about">Hello About</Route>
        <Route path="products/:id">
          Product {JSON.stringify(router.params)}
        </Route>
        <Route path=":url">{router.params.url} Not found</Route>
      </Router>
    </div>
  )
}

export default App
