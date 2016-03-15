import React from 'react'
import { render } from 'react-dom'
import createHistory from '../node_modules/history/lib/createBrowserHistory'
import myro from 'myro'
import Router, { Link } from './react-myro'

let history = createHistory()

const ACTIVE = {color: 'red'}

const App = (props) => (
    <div>
        <h1>APP!</h1>
        <ul>
            <li><Link {...props} href={props.route.home()} activeStyle={ACTIVE}>/</Link></li>
            <li><Link {...props} href={props.route.home.users()} activeStyle={ACTIVE}>/users</Link></li>
            <li><Link {...props} href={props.route.home.users.user({ name: 'myro' })}
                                 activeStyle={ACTIVE}>/users/myro</Link></li>
            <li><Link {...props} href={props.route.home.about()} activeStyle={ACTIVE}>/about</Link></li>
        </ul>
        {props.children}
    </div>
)

const Index = () => (
    <div>
        <h2>Index!</h2>
    </div>
)

const Users = ({ children }) => (
    <div>
        <h2>Users</h2>
        {children}
    </div>
)

const UsersIndex = () => (
    <div>
        <h3>UsersIndex</h3>
    </div>
)

const User = ({ params }) => (
    <div>
        <h3>User {params.name}</h3>
    </div>
)

const About = () => (
    <div>
        <h2>About</h2>
    </div>
)

const route = myro({
    '': {
        name: 'home',
        props: { component: App, defaultIndex: Index },
        routes: {
            '/users': {
                name: 'users',
                props: { component: Users, defaultIndex: UsersIndex },
                routes: {
                    '/:name': {
                        name: 'user',
                        props: { component: User }
                    }
                }
            },

            '/about': {
                name: 'about',
                props: { component: About }
            }
        }
    }
})

render(<Router history={history} route={route} />, window.app)
