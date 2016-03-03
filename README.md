# j-walk

[![Build Status](https://img.shields.io/travis/scniro/j-walk.svg?style=flat-square)](https://travis-ci.org/scniro/j-walk)
[![NPM Version](https://img.shields.io/npm/v/j-walk.svg?style=flat-square)](https://www.npmjs.com/package/j-walk)

> simple dot notation JavaScript object getter/setter

## Install

```
<npm|bower> install j-walk
```

## API

#### jw(*selector*).get(*key*)
> returns `undefined` if not found
 
#### jw(*selector*).set(*key*, *value*)

> create and set property value if `undefined` through the nesting chain
> stops new value creation at first `undefined` array selector

#### jw(*selector*).exists(*key*)

> truthy assertion if property is defined
 

```javascript

// sample usages
 
var jw = require('j-walk'); // browser => window.jw

var base = {'root': 42};

jw(base).get('root');             // -- 42
jw(base).get('root.nested-a');    // -- undefined

var base = {
    'root': {
        'nested-a': {
            'nested-b': {
                'nested-c': 42
            }
        },
        'sibling-a': 84
    }
};
    
jw(base).get('root.nested-a.nested-b.nested-c');    // -- 42
jw(base).get('root.nested-a.sibling-a');            // -- 84

var base = [
    {'id': 2, value: 21},
    {'id': 4, value: 42},
    {'id': 6, value: 84, name: 'scniro'}
];

jw(base).get('[id=4].value')           // -- 42
jw(base).get('[id=5].value')           // -- undefined
jw(base).get('[name=scniro].value')    // -- 84

var base = {
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

jw(base).get('root.collectionA.[id=2].collectionB.[id=20].value')    // -- 42

var base = {};
jw(base).set('root.nested.sub', 42);         // -- set simple value
jw(base).set('root.nested', { sub: 42 });    // -- set object value
// base = { root: { sub: { nested: 42 } } }

var base = { 'root': [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 30}]};

jw(base).set('root.[id=2]', {other: 'foo'});
// 'root': [{id: 1, value: 10}, {id: 2, value: 20, other: 'foo'}, [...]

var base = {'root': null};
jw(base).exists('root')           // -- true
jw(base).exists('root.nested')    // -- false

```
    