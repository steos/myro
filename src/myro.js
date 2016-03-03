'use strict';

import trimStart from 'lodash/trimStart'
import trimEnd from 'lodash/trimEnd'
import template from 'lodash/template'
import isObject from 'lodash/isObject'
import assign from 'lodash/assign'

const placeHolderRegex = /:([a-zA-Z_][a-zA-Z0-9_]*)/g;

const trimLeadingColon = s => trimStart(s, ':')

function zipObject(keys, vals) {
  const obj = {}
  keys.forEach((key, index) => obj[key] = vals[index])
  return obj
}

function map(obj, f) {
  const result = []
  for (const k in obj) {
    if (obj.hasOwnProperty(k)) result.push(f(obj[k], k))
  }
  return result
}

function fromPairs(pairs) {
  const obj = {}
  pairs.forEach(([key, val]) => obj[key] = val)
  return obj
}

function assembleRoute(segment, routes = {}) {
    const renderPath = template(segment, {interpolate: placeHolderRegex});
    return assign(renderPath, assemble(routes, segment));
}

function assemble(routes, prefix = '') {
    return fromPairs(map(routes, (val, key) => {
        const name = isObject(val) ? val.name : val;
        return [name, assembleRoute(prefix + key, isObject(val) ? val.routes : null)];
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

function match(routes, path, parent = null) {
    const [matched, segment] = findMatch(routes, path)
    if (!matched) return null
    const spec = routes[segment];
    const name = isObject(spec) ? spec.name : spec;
    const props = isObject(spec) ? spec.props : {};
    const childRoutes = isObject(spec) ? spec.routes : null;
    const paramKeys = (segment.match(placeHolderRegex) || []).map(trimLeadingColon);
    const remainingPath = matched[matched.length-1]
    const params = zipObject(paramKeys, matched.slice(1, -1))
    if (childRoutes && remainingPath) {
        const childMatch = match(childRoutes, remainingPath, {name, props, params});
        if (childMatch) {
            const [childName, childParams, childRemaining, childProps, childParent] = childMatch
            return [
              [name].concat(childName),
              assign({}, params, childParams),
              childRemaining,
              childProps,
              childParent.concat(parent)
            ];
        }
    }
    return [[name], params, remainingPath, props, [parent]];
}

function resolve(routes, resolveRoute, path) {
    const matched = match(routes, trimEnd(path, '/'))
    if (matched) {
        const [keys, params, remaining, props, parents] = matched
        return {
            params,
            remaining,
            props,
            parent: parents.reduceRight((parent, child) => assign({parent}, child), null),
            route: resolveRoute(keys),
            name: keys.join('.')
        }
    }
    return null
}

function myro(routes) {
    const routeFns = assemble(routes)
    const resolveRoute = path => path.reduce((obj, key) => obj[key], routeFns)
    return assign(path => resolve(routes, resolveRoute, path), routeFns)
}

export default myro
