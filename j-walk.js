function jwEngine() {

    function constructNestedObject(properties, target, value) {

        var object = {};
        properties.reduce(function (o, s) {
            return s === target ? o[s] = value : o[s] = {};
        }, object);
        return object;
    }

    function parseQuery(criteria) {

        var tree = criteria.split('.')
        var bracketsRegex = /\[(.*?)\]/;
        var query = [];

        tree.forEach(function (value) {
            if (value.match(bracketsRegex)) {
                var name = value.split(bracketsRegex).filter(function (x) {
                    return x !== ''
                })[0]
                var arr = value.split(bracketsRegex)[1]
                query.push({'prop': name, 'index': arr})
            } else {
                query.push(value)
            }
        });

        return query;
    }

    return {
        'constructNestedObject': constructNestedObject,
        'parseQuery': parseQuery
    }
}

function jw(o) {

    function get(o, query) {

        var tree = engine.parseQuery(query)
        var found;

        function find(o) {
            var property = tree.shift();

            if (o.hasOwnProperty(property) && tree.length > 0) {
                find(o[property])
            } else {
                found = o[property]
                return;
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
        if (!query || typeof query !== 'string')
            return 'get error'

        return get(o, query);
    }

    this.set = function (query, value) {
        if (!query || typeof query !== 'string')
            return 'set error'

        return set(o, query, value)
    }

    this.exists = function (query) {
        if (!query || typeof query !== 'string')
            return 'exists error'

        return exists(o, query)
    }

    return this;
}

var engine = new jwEngine();

//var ob1 = {
//    'root': [
//        {'a': 2},
//        {'b': {'sub': 4}},
//        {'c': {'sub': [{'x': 10}, {'y': 20}, {'z': 30}]}}
//    ]
//}
//
//jw({}).get('sub')

//var a = jw(ob1).get('root[a]') // 2
//
//var b = jw(ob1).get('root[b].sub') // 4
//
//var c = jw(ob1).get('root[c].sub[x]') // 20
//
//console.log(a);
//console.log(b);
//console.log(c);

module.exports.jw = jw;
module.exports.jwEngine = jwEngine;
