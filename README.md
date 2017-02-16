# myro

[![Build Status](https://travis-ci.org/steos/myro.svg?branch=master)](https://travis-ci.org/steos/myro)

__myro__ is a universal bidirectional micro-router.

It works with pure data and is only concerned with route matching.
No assumptions are made on how to handle or dispatch a route match.
Implementation of that logic is left to the user.

## Getting Started

### Installation

```
npm install myro --save
```

### Example

```js

import myro from 'myro'

const route = myro({
    '/users': {
        name: 'users',
        routes: {
            '/:name': {
                name: 'user'
            }
        }
    },

    '/about': {
        name: 'about'
    },

    '/': {
        name: 'index'
    },
})

// match routes...
route('/users/foo')) // {name: "users.user", params: {name: "foo"}, route: fn}
route('/about')) //  {name: "about", params: {}, ... }


// retrieve the path
route.users.user({name: 'foo'}) // "/users/foo"
route.about() // "/about"


```

## Documentation

- [Introduction](doc/intro.md)
- Myro Examples (Coming Soon)
- Myro React Examples (Coming Soon)

## License

Copyright © 2016 Stefan Oestreicher and contributors.

Distributed under the terms of the BSD-3-Clause license.
