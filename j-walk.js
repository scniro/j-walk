function jw(o) {

    function get(o, query) {

        var tree = query.split('.')
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
        var tree = query.split('.')
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

        var tree = query.split('.')
        var nested, identified, last, define;
        var exists = [];

        function nest(names) {
            var object = {};
            names.reduce(function (o, s) {
                return s === define ? o[s] = value : o[s] = {};
            }, object);
            return object;
        };

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
                define = undef[undef.length - 1];
                last = undef[0]
                nested = nest(undef);

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

    this.exists = function(query) {
        if (!query || typeof query !== 'string')
            return 'exists error'

        return exists(o, query)
    }

    return this;
}

module.exports = jw;
