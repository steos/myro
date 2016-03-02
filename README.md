#Myro

__Myro__ is a bidirectional universal micro-router.

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
route('/users/foo')) // {$name: "users.user", $params: {name: "foo"}, $route: fn}
route('/about')) //  {$name: "home.about", $params: {}, ... }


// retrieve the path
route.users.user({name: 'foo'}) // /users/foo
route.about() // /about


```

###Myro Examples

Coming soon.

###Myro - React Examples

Coming soon.

# License

Copyright © 2016 Stefan Oestreicher and contributors.

Distributed under the terms of the BSD-3-Clause license.
