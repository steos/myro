# Introduction

The myro API provides only one function which takes a route config and returns
a router function. The router function takes a path and returns a route match
or `null` if no route matched the given path.

```js
import myro from 'myro'
const route = myro({...})
route('/foo/bar/baz')
```

## Route Config

The most basic route config is a simple mapping from paths to route names.

```js
const routes = {
  '/foo/bar': 'foo',
  '/lorem/ipsum': 'lorem'
}
```

Myro uses the route names to create properties on the router function.
Those allow you to generate corresponding URLs:

```js
const route = myro(routes)
route.foo()     // "/foo/bar"
route.lorem()   // "/lorem/ipsum"
```

### Route Parameters

You can use placeholders in the route paths to capture parameters.
They are indicated by a leading colon:

```js
const routes = {
  '/hello/:who': 'hello',
}
```

The captured parameters can be accessed through the `params` property on the
route match object.

```js
const route = myro(routes)
const match = route('/hello/myro')
match.params // {who: "myro"}
```

You can pass a params object to the corresponding function to generate a URL:

```js
route.hello({who: 'world'}) // "/hello/world"
```

### Route Props

Sometimes it may be enough just using the route names to write your dispatch
logic. But it can be made easier by associating arbitrary data with a route.
You can do this using an object instead of a simple string:

```js
const routes = {
  '/hello/:who': {
    name: 'hello',
    props: {
      component: HelloComponent
    }
  }
}
```

The route must always have a name so we have to give it a `name` property.
The `props` object can be used for arbitrary data and can be accessed through
the route match object.

```js
const route = myro(routes)
const match = route('/hello/route-props')
match.props // {component: HelloComponent}
```

### Nesting Routes

Routes can also be nested. Every route definition can specify a `routes` property
where child routes can be defined:

```js
const route = myro({
  '/hello': {
    name: 'hello',
    props: {
      message: () => 'Hello World!'
    },
    routes: {
      '/:who': {
        name: 'named',
        props: {
          message: ({who}) => `Hello ${who}!`
        }
      }
    }
  }
})
const dispatch = path => {
  const {props, params} = route(path)
  return props.message(params)
}
dispatch('/hello') // "Hello World!"
dispatch('/hello/myro') // "Hello myro!"
```

The URL generation functions will also be nested:

```js
route.hello() // "/hello"
route.hello.named({who: "world"} // "/hello/world"
```

Route names have to be unique only among their siblings.
