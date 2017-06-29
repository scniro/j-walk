function exception(message) {
  Error.captureStackTrace && Error.captureStackTrace(this, this.constructor);
  this.name = this.constructor.name;
  this.message = message;
}

function worker() {

  function constructNestedObject(map, value) {

    function nest(constructed, propArray, value, queryProperties) {

      let p = propArray.shift();

      if (p && propArray.length > 0) {
        constructed[p['property']] = p.isArray ? [] : {};
        nest(constructed[p['property']], propArray, value, queryProperties)
      } else {
        constructed[p['property']] = value;
      }

      return constructed;
    }

    return nest({}, map.undefined, value, map.queryProperties);
  }

  function getNestedMapping(query, identified) {

    let undefined = [];
    let queryProperties = {};

    query.slice(identified.length, query.length).forEach(function (x) {

      let push = {'property': x, 'isArray': false, value: null};

      undefined.push(push);
    });

    return {
      queryProperties,
      undefined
    }
  }

  function parseQuery(criteria) {

    if (!criteria || typeof criteria !== 'string')
      throw new exception('j-walk: invalid selector query format. expected: string');

    let tree = criteria.split('.');
    let bracketsRegex = /\[(.*?)\]/;

    for (let i = 0; i < tree.length; i += 1) {
      if (tree[i].match(bracketsRegex)) {
        let transformed = tree[i].split(bracketsRegex).filter(function (x) {
          return x !== ''
        });
        tree[i] = transformed
      }
    }

    return tree;
  }

  return {
    constructNestedObject,
    getNestedMapping,
    parseQuery
  }
}

function jwalk(o) {
  if (!o || typeof o !== 'object')
    throw new exception('j-walk: invalid selector. expected: object');

  let self = this;

  function exists(o, query) {

    let tree = engine.parseQuery(query);
    let exists = false;

    function find(o) {
      let property = tree.shift();

      if (o.hasOwnProperty(property) && tree.length > 0) {
        find(o[property])
      } else {
        if (Array.isArray(o)) {
          let interest = tree.shift();
          let key = property[0].split('=')[0];
          let keyValue = property[0].split('=')[1];
          for (let i = 0; i < o.length; i += 1) {
            if (o[i][key] == keyValue) {
              if (interest)
                return tree.length > 0 ? find(o[i][interest]) : exists = o[i].hasOwnProperty(interest);
              else
                return exists = true;
            }
          }
        } else
          return exists = o.hasOwnProperty(property)
      }
    }

    find(o);
    return exists;
  }

  function get(o, query) {

    let tree = engine.parseQuery(query);
    let found;

    function find(o) {
      let property = tree.shift();

      if (Array.isArray(property)) {
        let interest = tree.shift();
        let key = property[0].split('=')[0];
        let keyValue = property[0].split('=')[1];
        for (let i = 0; i < o.length; i += 1) {
          if (o[i][key] == keyValue)
            return tree.length > 0 ? find(o[i][interest]) : found = o[i][interest]
        }
      } else
        return o.hasOwnProperty(property) && tree.length > 0 ? find(o[property]) : found = o[property]
    }

    find(o);
    return found;
  }

  function set(o, query, value) {

    let tree = engine.parseQuery(query);
    let exists = [];

    function walk(obj, value) {

      let property = tree.shift();

      if (obj.hasOwnProperty(property) && !Array.isArray(obj) && tree.length > 0) {
        exists.push(property);
        if (tree.length !== 0)
          walk(obj[property], value)
      } else {
        if (Array.isArray(obj)) {
          let identifier = property[0].split('=')[0];
          let identifierKey = property[0].split('=')[1];

          for (let i = 0; i < obj.length; i += 1) {
            let found = false;
            if (obj[i][identifier] == identifierKey) {
              found = true;
              let suppliedKeys = Object.keys(value);
              if (tree.length !== 0) {
                exists.push(property);
                return walk(obj[i], value)
              } else {
                for (let o = 0; o < suppliedKeys.length; o += 1) {
                  obj[i][suppliedKeys[o]] = value[suppliedKeys[o]];
                }
              }
            }
          }
        } else {
          let nestedMapping = engine.getNestedMapping(engine.parseQuery(query), exists);
          let nested = engine.constructNestedObject(nestedMapping, value);
          if (nested)
            obj[property] = nested[property]
        }
      }
    }

    walk(o, value)
  }

  self.exists = function (query) {
    return exists(o, query)
  };

  self.get = function (query) {
    return get(o, query);
  };

  self.set = function (query, value) {
    return set(o, query, value)
  };

  return self;
}

let engine = new worker();

module.exports = jwalk;
module.exports.worker = worker;
module.exports.jwException = exception;