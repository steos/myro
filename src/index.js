'use strict';

var _ = require('lodash');

var placeHolderRegex = /:([a-zA-Z_][a-zA-Z0-9_]*)/g;

var trimLeadingColon = _.ary(_.partialRight(_.trimLeft, ':'), 1);

function assembleRoute(segment, routes) {
    var renderPath = _.template(segment, {interpolate: placeHolderRegex});
    return _.assign(renderPath, assemble(routes || {}, segment));
}

function assemble(routes, prefix) {
    return _.zipObject(_.map(routes, function(val, key) {
        var name = _.isObject(val) ? val.$name : val;
        return [name, assembleRoute((prefix || '') + key, _.isObject(val) ? val.$routes : null)];
    }));
}

function match(routes, path) {
    for (var segment in routes) {
        if (!routes.hasOwnProperty(segment)) continue;
        var spec = routes[segment];
        var name = _.isObject(spec) ? spec.$name : spec;
        var payload = _.isObject(spec) ? _.omit(spec, ['$name', '$routes']) : {};
        var subRoutes = _.isObject(spec) ? spec.$routes : null;
        var paramKeys = (segment.match(placeHolderRegex) || []).map(trimLeadingColon);
        var re = new RegExp('^' + segment.replace(placeHolderRegex, '([^/]+)') + '(/.+)?$');
        var matched = path.match(re);
        if (matched) {
            var remainingPath = _.last(matched);
            var params = _.zipObject(paramKeys, _.dropRight(_.rest(matched)));
            if (subRoutes && remainingPath) {
                var subMatch = match(subRoutes, remainingPath);
                if (subMatch) {
                    var subName = subMatch[0];
                    var subParams = subMatch[1];
                    var subRemaining = subMatch[2];
                    var subPayload = subMatch[3];
                    return [[name].concat(subName), _.assign(params, subParams), subRemaining, subPayload];
                }
            }
            return [[name], params, remainingPath, payload];
        }
    }
    return null;
}

module.exports = function(routes) {
    var router = assemble(routes);
    function resolve(path) {
        var matched = match(routes, path);
        if (matched) {
            var keys = matched[0];
            var params = matched[1];
            var remaining = matched[2];
            var payload = matched[3];
            var route = keys.reduce(function(obj, key) { return obj[key]; }, router);
            var result = {
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

