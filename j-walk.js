function jwException(message) {
    Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
}

function jwEngine() {

    function constructNestedObject(properties, target, value, containsArray, isArray) {
        var object = {};
        var arr = [];

        properties.reduce(function (o, s) {

            var constructed =  s === target ? o[s] = value : o[s] = {};

            if(s !== target)
                arr.push(constructed)

            arr = arr.filter(function(x){ return x !== value })

            if(s !== target && containsArray) {
                o[s] = arr
            }

            return constructed;
        }, object);

        return isArray ? [object] : object
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

            if (Array.isArray(property)) {
                for (var key in o) {
                    if (o[key].hasOwnProperty(property[0])) {
                        if (tree.length > 0) {
                            find(o[key][property[0]])
                        } else {
                            found = o[key][property[0]]
                            return;
                        }
                    }
                }
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
                if (Array.isArray(obj[property])) {

                    var contained = false;

                    for (var key in obj[property]) {
                        var k = Object.keys(obj[property][key])[0]
                        if (k === last) {

                            obj[property][key][k] = value;

                            //if(exists.length > 0) {
                            // recurse
                            //}

                            contained = true;
                            return;
                        }
                    }

                    if (!contained) {
                        obj[property].push(nested[0])
                    }

                } else {
                    if (identified) {
                        obj[identified][last] = nested[last]
                    } else {
                        obj[last] = nested[last]
                    }
                }
            }
        }

        function traverse(obj) {

            var property = tree.shift();

            if (obj.hasOwnProperty(property) && tree.length > 0) {
                exists.push(property)
                traverse(obj[property])
                // prob search for middle array
            } else {

                var  containArray = false;

                if(query.match(/\[(.*?)\]/)) {
                    containArray = true;
                }

                var reference = query.replace(/[\[\]']+/g, '').split('.').filter(function (x) {
                    return x !== ''
                })
                var undef = reference.filter(function (i) {
                    return exists.indexOf(i) < 0;
                });
                identified = exists[exists.length - 1];
                last = undef[0]
                //nested = engine.constructNestedObject(undef, undef[undef.length - 1], value, Array.isArray(property))

                nested = engine.constructNestedObject(undef, undef[undef.length - 1], value, containArray, Array.isArray(property))

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

module.exports.jw = jw;
module.exports.jwEngine = jwEngine;
module.exports.jwException = jwException;
