'use strict';

import _ from 'lodash'

const placeHolderRegex = /:([a-zA-Z_][a-zA-Z0-9_]*)/g;

const trimLeadingColon = _.ary(_.partialRight(_.trimStart, ':'), 1);

function assembleRoute(segment, routes = {}) {
    const renderPath = _.template(segment, {interpolate: placeHolderRegex});
    return _.assign(renderPath, assemble(routes, segment));
}

function assemble(routes, prefix = '') {
    return _.fromPairs(_.map(routes, (val, key) => {
        const name = _.isObject(val) ? val.name : val;
        return [name, assembleRoute(prefix + key, _.isObject(val) ? val.routes : null)];
    }));
}

function matchPath(path, segment) {
  const re = new RegExp('^' + segment.replace(placeHolderRegex, '([^/]+)') + '(/.+)?$');
  return path.match(re);
}

function findMatch(routes, path) {
  for (const segment in routes) {
    if (!routes.hasOwnProperty(segment)) continue
    const match = matchPath(path, segment)
    if (match) return [match, segment]
  }
  return []
}

function attachParent(obj, parent) {
  // TODO this is horrible
  let root = obj
  while (root.parent) root = root.parent
  root.parent = parent
}

function match(routes, path, parent = null) {
    const [matched, segment] = findMatch(routes, path)
    if (!matched) return null
    const spec = routes[segment];
    const name = _.isObject(spec) ? spec.name : spec;
    const props = _.isObject(spec) ? spec.props : {};
    const childRoutes = _.isObject(spec) ? spec.routes : null;
    const paramKeys = (segment.match(placeHolderRegex) || []).map(trimLeadingColon);
    const remainingPath = _.last(matched);
    const params = _.zipObject(paramKeys, _.dropRight(_.tail(matched)));
    if (childRoutes && remainingPath) {
        const childMatch = match(childRoutes, remainingPath, {name, props});
        if (childMatch) {
            const [childName, childParams, childRemaining, childProps, childParent] = childMatch
            attachParent(childParent, parent)
            return [
              [name].concat(childName),
              _.assign(params, childParams),
              childRemaining,
              childProps,
              childParent
            ];
        }
    }
    return [[name], params, remainingPath, props, parent];
}

function resolve(routes, resolveRoute, path) {
    const matched = match(routes, path);
    if (matched) {
        const [keys, params, remaining, props, parent] = matched
        return {
            params,
            remaining,
            props,
            parent,
            route: resolveRoute(keys),
            name: keys.join('.')
        }
    }
    return null;
}

function myro(routes) {
    const routeFns = assemble(routes);
    const resolveRoute = path => path.reduce((obj, key) => obj[key], routeFns)
    return _.assign(_.partial(resolve, routes, resolveRoute), routeFns);
}

export default myro
