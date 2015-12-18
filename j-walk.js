function jwException(message) {
    Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
}

function jwEngine() {

    function constructNestedObject(map, value) {

        function merge(obj1, obj2) {
            var obj3 = {};
            for (var attrname in obj1) {
                obj3[attrname] = obj1[attrname];
            }
            for (var attrname in obj2) {
                obj3[attrname] = obj2[attrname];
            }
            return obj3;
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
                    constructed.push(merged) // value

                } else {
                    constructed[p['property']] = value
                }
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

            } else {
                push.property = x
            }

            undefined.push(push)

            if (Array.isArray(x) && undefined.length > 1) {
                undefined[undefined.length - 2].isArray = true;
            }
        });

        var map = {
            'undefined': undefined,
            'queryProperties': queryProperties
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

        return tree;
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

                    if (o[i][key] == keyValue) {
                        if (tree.length > 0) {
                            return find(o[i][interest])
                        } else {
                            found = o[i][interest];
                            return;
                        }
                    }
                }

            } else {
                if (o.hasOwnProperty(property) && tree.length > 0) {
                    return find(o[property])
                } else {
                    found = o[property]
                    return;
                }
            }
        }

        find(o)
        return found;
    }

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

                            if (interest) {
                                if (tree.length > 0) {
                                    return find(o[i][interest])
                                } else {
                                    exists = o[i].hasOwnProperty(interest)
                                    return;
                                }
                            } else {
                                exists = true;
                                return;
                            }
                        }
                    }

                } else {
                    exists = o.hasOwnProperty(property)
                    return;
                }
            }
        }

        find(o)
        return exists;
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

    this.get = function (query) {
        return get(o, query);
    }

    this.set = function (query, value) {
        return set(o, query, value)
    }

    this.exists = function (query) {
        return exists(o, query)
    }

    return this;
}

var engine = new jwEngine();

module.exports.jw = jw;
module.exports.jwEngine = jwEngine;
module.exports.jwException = jwException;
