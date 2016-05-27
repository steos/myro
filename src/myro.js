'use strict';

import trimStart from 'lodash/trimStart'
import trimEnd from 'lodash/trimEnd'
import template from 'lodash/template'
import assign from 'lodash/assign'

const placeHolderRegex = /:([a-zA-Z_][a-zA-Z0-9_]*)/g;

const isStr = x => Object.prototype.toString.call(x) === '[object String]'

const isArray = x => Object.prototype.toString.call(x) === '[object Array]'

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

function mapObj(obj, f) {
  return zipObject(Object.keys(obj), map(obj, f))
}

function fromPairs(pairs) {
  const obj = {}
  pairs.forEach(([key, val]) => obj[key] = val)
  return obj
}

function specObj(spec) {
  return isStr(spec) ? {name: spec} : spec
}

function assembleRoute(prefix, segment, routes = {}, recur = false) {
    const renderPath = template(prefix+segment, {interpolate: placeHolderRegex});
    const render = !recur ? renderPath : params => {
      if (isArray(params)) {
        if (!recur) throw new Error('multiple param objects only allowed for recursive route!')
        return prefix + params.map(template(segment, {interpolate: placeHolderRegex})).join('')
      }
      return renderPath(params)
    }
    return assign(render, assemble(routes, prefix+segment));
}

function assemble(routes, prefix = '') {
    return fromPairs(map(routes, (val, key) => {
        const {name, routes = {}, recur = false} = specObj(val)
        return [name, assembleRoute(prefix, key, routes, recur)]
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
    const spec = specObj(routes[segment])
    const {
      name,
      props = {},
      routes: childRoutes = null,
      recur = false
    } = spec
    const paramKeys = (segment.match(placeHolderRegex) || []).map(s => trimStart(s, ':'))
    const remainingPath = matched[matched.length-1]
    const params = zipObject(paramKeys, matched.slice(1, -1))
    if (remainingPath && (childRoutes || recur)) {
        let childMatch = null
        if (childRoutes) {
          childMatch = match(childRoutes, remainingPath, {name, props, params})
        } else if (recur) {
          childMatch = match({[segment]: spec}, remainingPath, {name, props, params})
        } else {
          throw new Error()
        }
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
        // console.log("matched", keys, Object.keys(routeFns))
        return {
            params,
            remaining,
            props,
            parent: parents.reduceRight((parent, child) => assign({parent}, child)),
            route: keys.reduce((obj, key) => obj[key] || obj, routeFns),
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
