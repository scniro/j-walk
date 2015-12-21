# j-walk
A simple JavaScript object getter/setter

##### Getting Started

```
npm install j-walk
```

* Include the `j-walk` module

```javascript
var jw = require('j-walk').jw;
```

##### `jw(obj).get('selector')`
 - returns `undefined` if not found
 

    // -- simple
    var base = {'root': 42};
    
    jw(base).get('root');            // -- 42
    jw(base).get('root.nested-a');   // -- undefined
    
    // -- nested
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
        
    jw(base).get('root.nested-a.nested-b.nested-c'); // -- 42
    jw(base).get('root.nested-a.sibling-a');         // -- 84
    
    // array - simple
    var base = [
        {'id': 2, value: 21},
        {'id': 4, value: 42},
        {'id': 6, value: 84, name: 'scniro'}
    ];

    jw(base).get('[id=4].value')        // -- 42
    jw(base).get('[id=5].value')        // -- undefined
    jw(base).get('[name=scniro].value') // -- 84
    
    // array - nested
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
    
    jw(base).get('root.collectionA.[id=2].collectionB.[id=20].value') // -- 42
    
##### `jw(obj).set('selector', value)`

 - will create and set property value if undefined through the nesting chain
 - will stop new value creation at firt undefined array selector

##### `jw(obj).exists('selector')`

 - return the truthy value if the property in question is defined - value is ignored
 
        
    