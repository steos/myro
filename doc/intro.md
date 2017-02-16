# Introduction

The myro API provides only one function which takes a route config and returns
a router function. The router function takes a path and returns a [route match](#route-match)
or `null` if no route matched the given path.

```js
import myro from 'myro'
const route = myro({...})
const match = route('/foo/bar/baz')
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

#### Param Merging

In a nested route match params from parent and child will be merged.
If they have the same name the child param will overwrite the parent.

```js
const route = myro({
  '/foo/:x': {
    name: 'foo',
    routes: {
      '/bar/:y': 'bar',
      '/baz/:x': 'baz'
    }
  }
})
const barMatch = route('/foo/foo-val/bar/bar-val')
barMatch.params // {x: 'foo-val', y: 'bar-val'}

const bazMatch = route('/foo/foo-val/baz/baz-val')
bazMatch.params // {x: 'baz-val'}
```

#### Route Match Parents

The route match object also provides a parent property that contains
the props and params of the parent route.
Given the previous example you could still access the parent param
even it was overwritten by the child through the parent property:

```js
bazMatch.params // {x: 'baz-val'}
bazMatch.parent.params // {x: 'foo-val'}
```

This works recursively, i.e. the parent itself also has a parent property.

## Matching Algorithm

The matching algorithm is very naive, it simply tries to match
each route sequentially and if successful recurses into child routes.

Therefore more specific routes have to come first, consider:

```js
const route = myro({
    '/foo': 'foo',
    '/foo/bar': 'foobar'
});
route('/foo/bar').name // 'foo'
```

In this example `/foo` will match first. To make this work put the more specific
route first or use child routes:

```js
const route = myro({
    '/foo': {
      name: 'foo',
      routes: {
        '/bar': 'bar'
      }
    }
});
route('/foo/bar').name // 'foo.bar'
```

### Partial Match

Route matches may be partial. In this case the match result will contain
a `remaining` property which contains the remaining path.

For example:
```js
const route = myro({
    '/foo/bar': 'foo'
})
const match = route('/foo/bar/baz') // {remaining: '/baz', name: 'foo' }
```

If you require a full match simply check for the remaining property to be null.

For example:
```js
// in your dispatch logic
match = route(path)
if (match == null || match.remaining != null) {
  // handle no match or only partial match
} else {
  // handle full match
}
```

## Route Match

The route match object provides the following properties:

- **name**

  The name of the route. For nested routes this will be formed by
  concatenating the names of all parents with the matched route
  separated by a dot. For example: `foo.bar.baz`

- **params**

  An object mapping parameter names to values.

- **props**

  The props object corresponding to the matched route.

- **route**

  The URL generation function for the matched route.

- **parent**

  An object containing the params and props of the parent route.

- **remaining**

  The remaining path after the match.
