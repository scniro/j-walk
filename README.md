# j-walk

[![Build Status](https://img.shields.io/travis/scniro/j-walk.svg?style=flat-square)](https://travis-ci.org/scniro/j-walk)
[![devDependency Status](https://img.shields.io/david/dev/scniro/j-walk.svg?label=devDeps&style=flat-square)](https://david-dm.org/scniro/j-walk#info=devDependencies)
[![Coverage](https://img.shields.io/coveralls/scniro/j-walk.svg?style=flat-square)](https://coveralls.io/github/scniro/j-walk)
[![NPM Version](https://img.shields.io/npm/v/j-walk.svg?style=flat-square)](https://www.npmjs.com/package/j-walk)

> tiny dot notation JavaScript object getter/setter

## Install

```
npm install j-walk
```

## API

#### `jwalk(*selector*).get(*key*)`
> returns `undefined` if not found
 
#### `jwalk(*selector*).set(*key*, *value*)`

> create and set property value if `undefined` through the nesting chain. Stops new value creation at first `undefined` array selector

#### `jwalk(*selector*).exists(*key*)`

> truthy assertion if property is defined

---

> `get`
```javascript
let jwalk = require('j-walk');

let base = {'root': 42};

jwalk(base).get('root');           // 42
jwalk(base).get('root.nested-a');  // undefined

let base = {
  'root': {
    'nested-a': {
      'nested-b': {
        'nested-c': 42
      }
    },
    'sibling-a': 84
  }
};
    
jwalk(base).get('root.nested-a.nested-b.nested-c');  // 42
jwalk(base).get('root.nested-a.sibling-a');          // 84

let base = [
  {'id': 2, value: 21},
  {'id': 4, value: 42},
  {'id': 6, value: 84, name: 'scniro'}
];

jwalk(base).get('[id=4].value');         // 42
jwalk(base).get('[id=5].value');         // undefined
jwalk(base).get('[name=scniro].value');  // 84

let base = {
  'root': {
    'collectionA': [
      {id: 1},
      {id: 2, collectionB: [
        {id: 10, value: 21},
        {id: 20, value: 42},
        {id: 30, value: 84}]
      },
    {id: 3}]
  }
};

jwalk(base).get('root.collectionA.[id=2].collectionB.[id=20].value')  // 42
```

> `set`
```javascript
let base = {};

jwalk(base).set('root.nested.sub', 42);
jwalk(base).set('root.nested', { sub: 42 });
// base = { root: { nested: { sub: 42 } } }

let base = {
  'root': [
    {id: 1, value: 10},
    {id: 2, value: 20},
    {id: 3, value: 30}
  ]
};

jwalk(base).set('root.[id=2]', {other: 'foo'});
// 'root': [{id: 1, value: 10}, {id: 2, value: 20, other: 'foo'}, [...]
```

> `exists`
```javascript
let base = {'root': null};
jwalk(base).exists('root')         // true
jwalk(base).exists('root.nested')  // false
```

## License

[MIT](./LICENSE) © 2017 [scniro](https://github.com/scniro)