import React, { PropTypes } from 'react'
import { extend } from 'lodash'

const Link = ({ href, navigate, children, activeStyle, isActive }) => (
    <a href={href}
       style={isActive(href)? activeStyle : {}}
       onClick={e => navigate(e, href)}>
        {children}
    </a>
)

Link.propTypes = {
    href: PropTypes.string.isRequired,
    isActive: PropTypes.func.isRequired,
    navigate: PropTypes.func.isRequired,
    activeStyle: PropTypes.object
}

const Router = React.createClass({
    unlisten: null,

    propTypes: {
        history: PropTypes.object.isRequired,
        route: PropTypes.func.isRequired
    },

    getInitialState() {
        return { pathName: '' }
    },

    componentWillMount() {
        this.unlisten = this.props.history.listen((location) => {
            this.setState({pathName: location.pathname})
        })
    },

    componentWillUnmount() {
        this.unlisten()
    },

    render() {
        const { history, route } = this.props
        const { pathName } = this.state
        const navigate = (e, path) => {
            history.push(path)
            e.preventDefault()
        }

        const isActive = (activePath, path) => activePath.indexOf(path) === 0
        const props = extend({}, this.props, {navigate, route, isActive: isActive.bind(null, pathName)})
        const routeDefinition = route(pathName)

        props.params = routeDefinition ? routeDefinition.params : {}

        function buildView(route, props, children) {
            const { component, defaultIndex } = route.props
            const childrenComponents = (defaultIndex && !children) ? React.createElement(defaultIndex, props, null) : children
            const comp = React.createElement(component, props, childrenComponents)
            return route.parent ? buildView(route.parent, props, comp) : comp
        }


        return (
            <div>
                { buildView(routeDefinition, props, null) }
            </div>
        )
    }
})

export {
    Link
}

export default Router
