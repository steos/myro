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
        const name = _.isObject(val) ? val.$name : val;
        return [name, assembleRoute(prefix + key, _.isObject(val) ? val.$routes : null)];
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

function match(routes, path) {
    const [matched, segment] = findMatch(routes, path)
    if (!matched) return null
    const spec = routes[segment];
    const name = _.isObject(spec) ? spec.$name : spec;
    const payload = _.isObject(spec) ? _.omit(spec, ['$name', '$routes']) : {};
    const subRoutes = _.isObject(spec) ? spec.$routes : null;
    const paramKeys = (segment.match(placeHolderRegex) || []).map(trimLeadingColon);
    const remainingPath = _.last(matched);
    const params = _.zipObject(paramKeys, _.dropRight(_.tail(matched)));
    if (subRoutes && remainingPath) {
        const subMatch = match(subRoutes, remainingPath);
        if (subMatch) {
            const [subName, subParams, subRemaining, subPayload] = subMatch
            return [[name].concat(subName), _.assign(params, subParams), subRemaining, subPayload];
        }
    }
    return [[name], params, remainingPath, payload];
}

export default function(routes) {
    const router = assemble(routes);
    function resolve(path) {
        const matched = match(routes, path);
        if (matched) {
            const [keys, params, remaining, payload] = matched
            const route = keys.reduce((obj, key) => obj[key], router);
            const result = {
                $params: params,
                $remaining: remaining,
                $route: route,
                $name: keys.join('.')
            };
            return _.isObject(payload) ? _.assign(payload, result) : result;
        }
        return null;
    }
    return _.assign(resolve, router);
};
