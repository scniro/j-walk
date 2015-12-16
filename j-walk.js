function jwException(message) {
    Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
}

function jwEngine() {

    function constructNestedObject(properties, target, value) {

        var object = {};
        properties.reduce(function (o, s) {
            return s === target ? o[s] = value : o[s] = {};
        }, object);
        return object;
    }

    function parseQuery(criteria) {

        if (!criteria || typeof criteria !== 'string')
            throw new jwException('j-walk: invalid selector query format. expected: string')

        var tree = criteria.split('.')
        var bracketsRegex = /\[(.*?)\]/;

        for(var i = 0; i < tree.length; i += 1) {
            if(tree[i].match(bracketsRegex)) {
                var transformed = tree[i].split(bracketsRegex).filter(function(x){ return x !== '' })
                tree[i] = transformed
            }
        }

        return tree;
    }

    return {
        'constructNestedObject': constructNestedObject,
        'parseQuery': parseQuery
    }
}

function jw(o) {

    if (!o || typeof o !== 'object' || Array.isArray(o))
        throw new jwException('j-walk: invalid selector. expected: object')

    function get(o, query) {

        var tree = engine.parseQuery(query)
        var found;

        function find(o) {
            var property = tree.shift();

            if(Array.isArray(property)) {
                console.log(o)
            } else {
                if (o.hasOwnProperty(property) && tree.length > 0) {
                    find(o[property])
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
                exists = o.hasOwnProperty(property)
                return;
            }
        }

        find(o)
        return exists;
    }

    function set(o, query, value) {

        var tree = engine.parseQuery(query)
        var nested, identified, last;
        var exists = [];

        function reverse(obj) {

            var property = exists.shift();

            if (obj.hasOwnProperty(property) && exists.length > 0) {
                reverse(obj[property])
            } else {

                if (identified) {
                    obj[identified][last] = nested[last]
                } else {
                    obj[last] = nested[last]
                }
            }
        }

        function traverse(obj) {

            var property = tree.shift();

            if (obj.hasOwnProperty(property) && tree.length > 0) {
                exists.push(property)
                traverse(obj[property])
            } else {

                var exist = query.split(property)[0].split('.').filter(function (x) {
                    return x !== ''
                });
                var undef = query.split(property)[1].split('.').filter(function (x) {
                    return x !== ''
                });
                undef.unshift(property)
                identified = exist[exist.length - 1];
                last = undef[0]
                nested = engine.constructNestedObject(undef, undef[undef.length - 1], value)

                reverse(o)
            }
        }

        traverse(o)
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

//var ob = {
//    'root': [
//        {'a': 2},
//        {'b': 4},
//        {'c': 6}
//    ]
//}
//
//console.log('final: ' + jw(ob).get('root.[a]'))

module.exports.jw = jw;
module.exports.jwEngine = jwEngine;
module.exports.jwException = jwException;
