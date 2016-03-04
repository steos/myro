'use strict';

import trimStart from 'lodash/trimStart'
import trimEnd from 'lodash/trimEnd'
import template from 'lodash/template'
import assign from 'lodash/assign'

const placeHolderRegex = /:([a-zA-Z_][a-zA-Z0-9_]*)/g;

const isStr = x => Object.prototype.toString.call(x) === '[object String]'

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
        const name = isStr(val) ? val : val.name
        return [name, assembleRoute(prefix + key, isStr(val) ? null : val.routes)]
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

function specObj(spec) {
  return isStr(spec) ? {name: spec} : spec
}

function match(routes, path, parent = null) {
    const [matched, segment] = findMatch(routes, path)
    if (!matched) return null
    const {name, props = {}, routes: childRoutes = null} = specObj(routes[segment])
    const paramKeys = (segment.match(placeHolderRegex) || []).map(s => trimStart(s, ':'))
    const remainingPath = matched[matched.length-1]
    const params = zipObject(paramKeys, matched.slice(1, -1))
    if (childRoutes && remainingPath) {
        const childMatch = match(childRoutes, remainingPath, {name, props, params})
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

function resolve(routes, routeFns, path) {
    const matched = match(routes, trimEnd(path, '/'))
    if (matched) {
        const [keys, params, remaining, props, parents] = matched
        return {
            params,
            remaining,
            props,
            parent: parents.reduceRight((parent, child) => assign({parent}, child)),
            route: keys.reduce((obj, key) => obj[key], routeFns),
            name: keys.join('.')
        }
    }
    return null
}

function myro(routes) {
    const routeFns = assemble(routes)
    return assign(path => resolve(routes, routeFns, path), routeFns)
}

export default myro
