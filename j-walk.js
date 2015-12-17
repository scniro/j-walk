function jwException(message) {
    Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.message = message;
}

function jwEngine() {

    function constructNestedObject(propArr, value) {

        var built = {};

        function nest(o) {


            if (propArr.length === 0)
                return;

            var property = propArr.shift();


            if (propArr.length === 0) {
                if (Array.isArray(o)) {
                    var push = {}
                    push[property['property']] = value ? value : {}

                    o.push(push)

                } else {

                    o[property['property']] = value ? value : {};
                }
            } else {
                if (property['isArray']) {
                    o[property['property']] = []
                } else {
                    o[property['property']] = {}
                }
            }

            nest(o[property['property']])
        }

        nest(built)

        return Object.keys(built).length > 0 ? built : null;
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
        var identified, nested, last;
        var exists = [];

        function reverse(obj) {

            var property = exists.shift();

            if (exists.length > 0) {
                for (var key in obj) {
                    if (Array.isArray(property)) {
                        for (var i = 0; i < obj.length; i += 1) {
                            var keys = Object.keys(obj[i])

                            if (keys[0] === property[0]) {
                                return reverse(obj[key][property[0]])
                            }
                        }
                    } else {
                        if (key === property) {
                            return reverse(obj[property])
                        }
                    }
                }
            } else {



                if (nested) {


                    if(identified) {

                        if(Array.isArray(obj[identified])) {



                            console.log('1')
                            return obj[identified].push(nested)
                        } else {
                            console.log('2')
                            return obj[identified][last] = nested[last]
                        }


                        //return obj[identified][last] = nested[last]
                    } else {


                        console.log('3')
                        obj[last] = nested[last]
                    }
                } else {
                    console.log('4')
                    return obj[identified] = value
                }
            }
        }

        function traverse(obj) {

            var property = tree.shift();

            if (tree.length < 0)
                return;

            for (var key in obj) {
                if (Array.isArray(property)) {
                    for (var i = 0; i < obj.length; i += 1) {
                        var keys = Object.keys(obj[i])

                        if (keys[0] === property[0]) {
                            exists.push(property)
                            return traverse(obj[key][property[0]])
                        }
                    }

                } else {
                    if (key === property) {
                        exists.push(property)
                        return traverse(obj[property])
                    }
                }
            }

            var reference = engine.parseQuery(query);
            var undefined = [];

            reference.slice(exists.length, reference.length).forEach(function (value) {

                var isArray = Array.isArray(value)

                if (isArray && undefined.length > 0)
                    undefined[undefined.length - 1].isArray = true;

                undefined.push({
                    'property': isArray ? value[0] : value,
                });
            });

            identified = exists.length > 0 ? exists[exists.length - 1] : null;
            last = undefined.length > 0 ? undefined[0].property : null;
            nested = engine.constructNestedObject(undefined, value);

            //console.log(nested)

            return reverse(o)
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
