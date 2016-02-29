#Myro

__Myro__ is a bidirectional isomorphic micro-router.

###Getting Started

####Installation

```
npm install myro --save
```

####Example

```

import myro from 'myro'

const route = myro({
    '/': {
        $name: 'index'
    },
    
    '/users': {
        $name: 'users',
        $routes: {
            '/:name': {
                $name: 'user'
            }
        }
    },
    
    '/about': {
        $name: 'about'
    }
})

// match routes...
router('/users/foo')) // {$name: "users.user", $params: {name: "foo"}, $route: fn}
router('/about')) //  {$name: "home.about", $params: {}, ... }


// retrieve the path
route.users.user({name: 'foo'}) // /users/foo
route.about() // /about


```

###Myro Examples

Coming soon.

###Myro - React Examples

Coming soon.

