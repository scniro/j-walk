function jwException(message) {
    Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
}

function jwHelper() {

    function constructNestedObject(map, value) {

        function merge(obj1, obj2) {

            var built = {};

            for (var attr in obj1) {
                built[attr] = obj1[attr];
            }
            for (var attr in obj2) {
                built[attr] = obj2[attr];
            }
            return built;
        }

        function nest(constructed, propArray, value, queryProperties) {

            var p = propArray.shift()

            if (!p)
                return null

            if (p && propArray.length > 0) {
                constructed[p['property']] = p.isArray ? [] : {}
                nest(constructed[p['property']], propArray, value, queryProperties)
            } else {
                if (Array.isArray(constructed)) {
                    var merged = merge(value, queryProperties)
                    constructed.push(merged)
                } else
                    constructed[p['property']] = value
            }

            return constructed;
        }

        return nest({}, map.undefined, value, map.queryProperties);
    }

    function getNestedMapping(query, identified) {

        var undefined = [];
        var queryProperties = {};

        query.slice(identified.length, query.length).forEach(function (x) {

            var push = {'property': null, 'isArray': false, value: null}

            if (Array.isArray(x)) {
                var p = x[0].split('=')[0]
                var v = x[0].split('=')[1]
                queryProperties[p] = v
                push.property = p;

            } else
                push.property = x

            undefined.push(push)

            if (Array.isArray(x) && undefined.length > 1)
                undefined[undefined.length - 2].isArray = true;
        });

        var map = {
            'queryProperties': queryProperties,
            'undefined': undefined
        }

        return map;
    }

    function parseQuery(criteria) {

        if (!criteria || typeof criteria !== 'string')
            throw new jwException('j-walk: invalid selector query format. expected: string')

        var tree = criteria.split('.')
        var bracketsRegex = /\[(.*?)\]/;

        for (var i = 0; i < tree.length; i += 1) {
            if (tree[i].match(bracketsRegex)) {
                var transformed = tree[i].split(bracketsRegex).filter(function (x) {
                    return x !== ''
                })
                tree[i] = transformed
            }
        }

        return tree || [];
    }

    return {
        'constructNestedObject': constructNestedObject,
        'getNestedMapping': getNestedMapping,
        'parseQuery': parseQuery
    }
}

function jw(o) {
    if (!o || typeof o !== 'object')
        throw new jwException('j-walk: invalid selector. expected: object')

    var self = this;

    function exists(o, query) {

        var tree = engine.parseQuery(query)
        var exists = false;

        function find(o) {
            var property = tree.shift();

            if (o.hasOwnProperty(property) && tree.length > 0) {
                find(o[property])
            } else {
                if (Array.isArray(o)) {
                    var interest = tree.shift();
                    var key = property[0].split('=')[0]
                    var keyValue = property[0].split('=')[1]
                    for (var i = 0; i < o.length; i += 1) {
                        if (o[i][key] == keyValue) {
                            if (interest)
                                return tree.length > 0 ? find(o[i][interest]) : exists = o[i].hasOwnProperty(interest)
                            else
                                return exists = true;
                        }
                    }
                } else
                    return exists = o.hasOwnProperty(property)
            }
        }

        find(o)
        return exists;
    }

    function get(o, query) {

        var tree = engine.parseQuery(query)
        var found;

        function find(o) {
            var property = tree.shift();

            if (Array.isArray(property)) {
                var interest = tree.shift();
                var key = property[0].split('=')[0]
                var keyValue = property[0].split('=')[1]
                for (var i = 0; i < o.length; i += 1) {
                    if (o[i][key] == keyValue)
                        return tree.length > 0 ? find(o[i][interest]) : found = o[i][interest]
                }
            } else
                return o.hasOwnProperty(property) && tree.length > 0 ? find(o[property]) : found = o[property]
        }

        find(o)
        return found;
    }

    function set(o, query, value) {

        var tree = engine.parseQuery(query)
        var exists = [];

        function walk(obj, value) {

            var property = tree.shift();

            if (obj.hasOwnProperty(property) && !Array.isArray(obj) && tree.length > 0) {
                exists.push(property)
                if (tree.length !== 0)
                    walk(obj[property], value)
            } else {
                if (Array.isArray(obj)) {
                    var identifier = property[0].split('=')[0]
                    var identifierKey = property[0].split('=')[1]

                    for (var i = 0; i < obj.length; i += 1) {
                        var found = false;
                        if (obj[i][identifier] == identifierKey) {
                            found = true;
                            var suppliedKeys = Object.keys(value)
                            if (tree.length !== 0) {
                                exists.push(property)
                                return walk(obj[i], value)
                            } else {
                                for (var o = 0; o < suppliedKeys.length; o += 1) {
                                    obj[i][suppliedKeys[o]] = value[suppliedKeys[o]];
                                }
                            }
                        }
                    }
                } else {
                    var nestedMapping = engine.getNestedMapping(engine.parseQuery(query), exists)
                    var nested = engine.constructNestedObject(nestedMapping, value)
                    if (nested)
                        obj[property] = nested[property]
                }
            }
        }

        walk(o, value)
    }

    self.exists = function (query) {
        return exists(o, query)
    }

    self.get = function (query) {
        return get(o, query);
    }

    self.set = function (query, value) {
        return set(o, query, value)
    }

    return self;
}

var engine = new jwHelper();

if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = jw;
    module.exports.jwHelper = jwHelper;
    module.exports.jwException = jwException;
}

if (typeof window !== 'undefined') {
    window.jw = jw;
}
