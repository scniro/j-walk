var chai = require('chai');
var expect = chai.expect;
var jw = require('./index.js');
var worker = new require('./index.js').worker();
var exception = require('./index.js').exception;

chai.should();

describe('j-walk tests:init', () => {

  it('should exist with API', () => {
    expect(jw).to.exist;

    var api = jw({});

    expect(api).to.have.property('get');
    expect(api).to.have.property('set');
    expect(api).to.have.property('exists');
  });

  it('should throw exception: exception - unable to parse selector query for invalid criteria', () => {
    expect(() => {
      jw(42).get('whatever')
    }).to.throw('j-walk: invalid selector. expected: object');

    expect(() => {
      jw('').get('whatever')
    }).to.throw('j-walk: invalid selector. expected: object');

    expect(() => {
      jw(true).get('whatever')
    }).to.throw('j-walk: invalid selector. expected: object');

    expect(() => {
      jw(undefined).get('whatever')
    }).to.throw('j-walk: invalid selector. expected: object');


    expect(() => {
      jw(null).get('whatever')
    }).to.throw('j-walk: invalid selector. expected: object');
  });
});

describe('j-walk tests:get', () => {

  it('should return the value: 42', () => {
    var base = {'root': 42};
    jw(base).get('root').should.equal(42);
  });

  it('should return the value: [object]', () => {
    var base = {
      'root': {
        'value': {
          'subvalue': 42
        }
      }
    };

    var expected = {
      'value': {
        'subvalue': 42
      }
    };

    jw(base).get('root').should.deep.equal(expected);
  });

  it('should return the value: 42. single nested. no siblings', () => {
    var base = {
      'root': {
        'nested-a': 42
      }
    };
    jw(base).get('root.nested-a').should.equal(42);
  });

  it('should return the value: [object]. single nested. no siblings', () => {
    var base = {
      'root': {
        'value': {
          'subvalue-1': {
            'subvalue-2': 42
          }
        }
      }
    };

    var expected = {
      'subvalue-1': {
        'subvalue-2': 42
      }
    };
    jw(base).get('root.value').should.deep.equal(expected);
  });

  it('should return the value: 42. deeply nested. no siblings', () => {
    var base = {
      'root': {
        'nested-a': {
          'nested-b': {
            'nested-c': 42
          }
        }
      }
    };
    jw(base).get('root.nested-a.nested-b.nested-c').should.equal(42);
  });

  it('should return the value: 42. single nested. root sibling value ignored - remains 84', () => {
    var base = {
      'root': {
        'nested-a': 42,
        'sibling-a': 84
      }
    };
    jw(base).get('root.nested-a').should.equal(42);
    base.root['sibling-a'].should.equal(84);
  });

  it('should return the value: 42. deeply nested. root sibling value ignored - remains 84', () => {
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
    jw(base).get('root.nested-a.nested-b.nested-c').should.equal(42);
    base.root['sibling-a'].should.equal(84);
  });

  it('should return the value: undefined. selector specified for empty object', () => {
    var base = {};
    expect(jw(base).get('root.nested-a')).to.be.undefined;
  });

  it('should return the value: undefined. single additional selector not defined on object', () => {
    var base = {
      'root': {
        'nested-a': {},
      }
    };
    expect(jw(base).get('root.nested-a.nested-b')).to.be.undefined;
  });

  it('should return the value: undefined. deeply nested selector not defined on object', () => {
    var base = {
      'root': {
        'nested-a': {},
      }
    };
    expect(jw(base).get('root.nested-a.nested-b.nested-c.nested-d')).to.be.undefined;
  });
});

describe('j-walk tests:get:array', () => {

  it('should return the value: 42. immediate array. immediate property. simple value', () => {

    var base = [
      {'id': 2, value: 21},
      {'id': 4, value: 42},
      {'id': 6, value: 84, name: 'scniro'}
    ];

    jw(base).get('[id=4].value').should.equal(42);
    jw(base).get('[name=scniro].value').should.equal(84);
  });

  it('should return the value: 42. immediate array. immediate property. object value', () => {

    var base = [
      {'id': 26, value: 21},
      {'id': 42, value: {something: 'foo'}},
      {'id': 84, value: 84}
    ]

    var expected = {something: 'foo'};

    jw(base).get('[id=42].value').should.deep.equal(expected);
  });

  it('should return the value: 42. single nested array selector. immediate property. simple value', () => {

    var base = {
      'root': [
        {'id': 26, value: 21},
        {'id': 42, value: 42},
        {'id': 84, value: 84}
      ]
    };

    jw(base).get('root.[id=42].value').should.equal(42);
  });

  it('should return the value: 42. single nested array selector. immediate property. object value', () => {

    var base = {
      'root': [
        {'id': 26, value: 21},
        {'id': 42, value: {'something': 'foo'}},
        {'id': 84, value: 84}
      ]
    };

    var expected = {'something': 'foo'};

    jw(base).get('root.[id=42].value').should.deep.equal(expected);
  });

  it('should return the value: 42. single nested array selector. deeply nested property. simple value', () => {

    var base = {
      'root': [
        {'id': 1, value: 21},
        {'id': 2, value: 42, nested: {deep: 42}},
        {'id': 3, value: 84}
      ]
    };

    jw(base).get('root.[id=2].nested.deep').should.equal(42);
  });

  it('should return the value: 42. single nested array selector. deeply nested property. simple value', () => {
    var base = {
      'root': [
        {'id': 1, value: 21},
        {'id': 2, value: 42, nested: {deep: {deeper: 'foo'}}},
        {'id': 3, value: 84}
      ]
    };

    var expected = {deeper: 'foo'};

    jw(base).get('root.[id=2].nested.deep').should.deep.equal(expected);
  });

  it('should return the value: 42. deeply nested array selector. immediate property. simple value', () => {

    var base = {
      'root': {
        'sub': {
          'deep': {
            'deeper': [
              {'id': 1, value: 21},
              {'id': 2, value: 42},
              {'id': 3, value: 84}
            ]
          }
        }
      }
    };

    jw(base).get('root.sub.deep.deeper.[id=2].value').should.equal(42);
  });

  it('should return the value: 42. traverse multiple specified arrays. immediate property. simple value', () => {

    var base = {
      'root': {
        'collectionA': [
          {id: 1},
          {id: 2, collectionB: [{id: 10, value: 21}, {id: 20, value: 42}, {id: 30, value: 84}]},
          {id: 3}
        ]
      }
    };

    jw(base).get('root.collectionA.[id=2].collectionB.[id=20].value').should.equal(42);
  });

  it('should return undefined. array selector can not be found', () => {

    var base = [
      {'id': 1, value: 21},
      {'id': 2, value: 42},
      {'id': 3, value: 84}
    ];

    expect(jw(base).get('[id=4].value')).to.be.undefined;
  });
});

describe('j-walk tests:set', () => {

  it('should set the root value: 42. empty object - undefined property', () => {
    var base = {};

    jw(base).set('root', 42);
    base.root.should.equal(42);
  });

  it('should set the immediate nested value: 42. empty object - undefined property', () => {
    var base = {};

    jw(base).set('root.nested', 42);
    base.root.nested.should.equal(42);
  });

  it('should set the deeply nested value: 42. empty object - undefined property', () => {
    var base = {};

    jw(base).set('root.nested.sub', 42);
    base.root.nested.sub.should.equal(42);
  });

  it('should set the immediate nested value: 42. object - pre-defined property', () => {
    var base = {
      nested: {}
    };

    jw(base).set('root.nested', 42);
    base.root.nested.should.equal(42);
  });

  it('should set the deeply nested value: 42. object - pre-defined property', () => {
    var base = {
      nested: {
        sub: {}
      }
    };

    jw(base).set('root.nested.sub', 42);
    base.root.nested.sub.should.equal(42);
  });

  it('should set the immediate nested value: 42. object - pre-defined target property. defined sibling. ignore sibling value of 84', () => {
    var base = {
      root: {
        sub: {},
        ignored: 84
      }
    };

    jw(base).set('root.sub', 42);
    base.root.sub.should.equal(42);
    base.root.ignored.should.equal(84);
  });

  it('should set the deeply nested value: 42. object - pre-defined target property. defined sibling. ignore sibling value of 84', () => {
    var base = {
      root: {
        sub: {
          inner: {}
        },
        ignored: 84
      }
    };

    jw(base).set('root.sub.inner', 42);
    base.root.sub.inner.should.equal(42);
    base.root.ignored.should.equal(84);
  });

  it('should set the immediate nested value: 42. object - pre-defined target property. defined sibling. ignore sibling value of 84', () => {
    var base = {
      root: {
        ignored: 84
      }
    };

    jw(base).set('root.sub', 42);
    base.root.sub.should.equal(42);
    base.root.ignored.should.equal(84);
  });

  it('should set the deeply nested value: 42. object - pre-defined target property. defined sibling. ignore sibling value of 84', () => {
    var base = {
      root: {
        ignored: 84
      }
    };

    jw(base).set('root.sub.inner', 42);
    base.root.sub.inner.should.equal(42);
    base.root.ignored.should.equal(84);
  });

  it('should set the immediate nested value: [object]. object - undefined target property. defined sibling. ignore sibling value of 84', () => {
    var base = {
      root: {
        ignored: 84
      }
    };

    var value = {val: 42};

    jw(base).set('root.sub', value);
    base.root.sub.should.deep.equal(value);
    base.root.ignored.should.equal(84);
  });

  it('should set the deeply nested value: [object]. object - undefined target property. defined sibling. ignore sibling value of 84', () => {
    var base = {
      root: {
        ignored: 84
      }
    };
    var value = {
      nested: {val: 42}
    }

    jw(base).set('root.sub', value);
    base.root.sub.should.deep.equal(value);
    base.root.ignored.should.equal(84);
  });

  it('should set the immediate nested value: [object]. object - pre-defined target property. defined sibling. ignore sibling value of 84', () => {
    var base = {
      root: {ignored: 84},
      sub: {val: {}}
    };

    var value = {val: 42};

    jw(base).set('root.sub', value);
    base.root.sub.should.deep.equal(value);
    base.root.ignored.should.equal(84);
  });
});

describe('j-walk tests:set:array', () => {

  it('should set array value - specified by id. single defined property.', () => {

    var base = {
      'root': [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 30}]
    };
    jw(base).set('root.[id=2]', {value: 42});
    base.root[1].value.should.equal(42)
  });

  it('should set array value - specified by id. single defined property. ignore sibling value.', () => {

    var base = {
      'root': [{id: 1, value: 10, secondary: 'a'}, {id: 2, value: 20, secondary: 'b'}, {
        id: 3,
        value: 30,
        secondary: 'c'
      }]
    };

    jw(base).set('root.[id=2]', {value: 42});
    base.root[1].value.should.equal(42);
    base.root[1].secondary.should.equal('b');
  });

  it('should set array value - specified by id. multiple defined properties', () => {

    var base = {
      'root': [{id: 1, value: 10, secondary: 'a'}, {id: 2, value: 20, secondary: 'b'}, {
        id: 3,
        value: 30,
        secondary: 'c'
      }]
    };

    jw(base).set('root.[id=2]', {value: 42, secondary: 'foo'});
    base.root[1].value.should.equal(42);
    base.root[1].secondary.should.equal('foo');
  });

  it('should set array value - specified by id. multiple undefined properties', () => {

    var base = {
      'root': [{id: 1}, {id: 2}, {id: 3}]
    };

    jw(base).set('root.[id=2]', {value: 42, secondary: 'foo'});
    base.root[1].value.should.equal(42);
    base.root[1].secondary.should.equal('foo');
  });

  it('should set array value - specified by id. single, undefined property.', () => {

    var base = {
      'root': [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 30}]
    };

    jw(base).set('root.[id=2]', {secondary: 'foo'});
    base.root[1].secondary.should.equal('foo');
  });

  it('should set array value - specified by id. single, undefined property. ignore sibling.', () => {

    var base = {
      'root': [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 30}]
    };

    jw(base).set('root.[id=2]', {secondary: 'foo'});
    base.root[1].value.should.equal(20);
    base.root[1].secondary.should.equal('foo');
  });

  it('should set array value - specified by id. undefined nested object value.', () => {

    var base = {
      'root': [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 30}]
    };

    jw(base).set('root.[id=2]', {secondary: {inner: 'bar'}});
    base.root[1].secondary.inner.should.equal('bar');
  });

  it('should set array value - specified by id. defined empty nested object value.', () => {

    var base = {
      'root': [{id: 1, value: 10}, {id: 2, value: 20, secondary: {inner: 'foo'}}, {id: 3, value: 30}]
    };

    jw(base).set('root.[id=2]', {secondary: {inner: 'bar'}});
    base.root[1].secondary.inner.should.equal('bar');
  });

  it('should set array value - specified by id. defined empty nested object value. ignore sibling.', () => {

    var base = {
      'root': [{id: 1, value: 10}, {id: 2, value: 20, secondary: {inner: 'foo'}}, {id: 3, value: 30}]
    };

    jw(base).set('root.[id=2]', {secondary: {inner: 'bar'}});
    base.root[1].value.should.equal(20);
    base.root[1].secondary.inner.should.equal('bar');
  });

  it('should set object value - mid array selector specified by id. immediate undefined object target. simple value', () => {

    var base = {
      'root': [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 30}]
    };

    jw(base).set('root.[id=2].sub', 42);
    base.root[1].sub.should.equal(42);
  });

  it('should set object value - mid array selector specified by id. immediate undefined object target. object value', () => {

    var base = {
      'root': [{id: 1, value: 10}, {id: 2, value: 20}, {id: 3, value: 30}]
    };

    jw(base).set('root.[id=2].sub', {'property': 42});
    base.root[1].sub.property.should.equal(42);
  });

  it('should set object value - mid array selector specified by id. immediate defined object target. simple value', () => {

    var base = {
      'root': [{id: 1, value: 10}, {id: 2, value: 20, sub: 2}, {id: 3, value: 30}]
    };

    jw(base).set('root.[id=2].sub', 42);
    base.root[1].sub.should.equal(42);
  });

  it('should set array value - traverse multiple specified arrays. defined object target.', () => {

    var base = {
      'root': [
        {id: 1, value: 10},
        {
          id: 2, value: 20, sub: [
          {id: 'sub1', value: 'a'},
          {id: 'sub2', value: 'b'},
          {id: 'sub3', value: 'c'}
        ]
        },
        {id: 3, value: 30}]
    };

    jw(base).set('root.[id=2].sub.[id=sub2]', {value: 'foo'});
    base.root[1].sub[1].value.should.equal('foo');
  });

  it('should set array value - traverse multiple specified arrays. undefined object target. ignore siblings', () => {

    var base = {
      'root': [
        {id: 1, value: 10},
        {
          id: 2, value: 20, sub: [
          {id: 'sub1', value: 'a'},
          {id: 'sub2', value: 'b'},
          {id: 'sub3', value: 'c'}
        ]
        },
        {id: 3, value: 30}]
    };

    jw(base).set('root.[id=2].sub.[id=sub2]', {other: 'bar'});
    base.root[1].sub[1].value.should.equal('b');
    base.root[1].sub[1].other.should.equal('bar');
  });
});

describe('j-walk tests:exists', () => {

  it('should return:true - defined property', () => {
    var base = {'root': null};
    jw(base).exists('root').should.be.true;
  });

  it('should return:true - defined property:nested', () => {
    var base = {
      'root': {
        'nested': {
          'deeper': null
        }
      }
    };
    jw(base).exists('root.nested.deeper').should.be.true;
  });

  it('should return:true - defined property:nested - shallow target - complex object', () => {
    var base = {
      'root': {
        'nested': {
          'deeper': null
        },
        'sibling': {}
      }
    };
    jw(base).exists('root.sibling').should.be.true;
  });

  it('should return:false - undefined property: object root', () => {
    var base = {};
    jw(base).exists('root').should.be.false;
  });

  it('should return:false - undefined property: single nested', () => {
    var base = {
      'root': {}
    };
    jw(base).exists('root.sub').should.be.false;
  });

  it('should return:false - undefined property: deeply nested', () => {
    var base = {
      'root': {
        'sub': {}
      }
    };
    jw(base).exists('root.sub.deeper').should.be.false;
  });
});

describe('j-walk tests:exists:array', () => {

  it('should return: true - base array with existing target object. whole object exists', () => {
    var base = {
      'root': [{id: 1, value: 21}, {id: 2, value: 42}]
    };

    jw(base).exists('root.[id=2]').should.be.true;
  });

  it('should return: true - base array with existing target object. whole object sub property exists', () => {
    var base = {
      'root': [{id: 1, value: 21}, {id: 2, value: 42, target: 'foo'}]
    };

    jw(base).exists('root.[id=2].target').should.be.true;
  });

  it('should return: false - base array with non-existing target object. whole object exists', () => {
    var base = {
      'root': [{id: 1, value: 21}, {id: 2, value: 42}]
    };

    jw(base).exists('root.[id=3]').should.be.false;
  });

  it('should return: true - base array with existing target object. whole object sub undefined property does not exist', () => {
    var base = {
      'root': [{id: 1, value: 21}, {id: 2, value: 42, target: 'foo'}]
    };

    jw(base).exists('root.[id=2].nothere').should.be.false;
  });

  it('should return: true -single nested array with existing target object. whole object exists', () => {
    var base = {
      'root': {
        collection: [{id: 1, value: 21}, {id: 2, value: 42}]
      }
    };

    jw(base).exists('root.collection.[id=2]').should.be.true;
  });

  it('should return: true traverse multiple arrays. whole object exists', () => {
    var base = {
      'root': [
        {id: 1, value: 10},
        {
          id: 2, value: 20, sub: [
          {id: 'sub1', value: 'a'},
          {id: 'sub2', value: 'b'},
          {id: 'sub3', value: 'c'}
        ]
        },
        {id: 3, value: 30}]
    };

    jw(base).exists('root.[id=2].sub.[id=sub3]').should.be.true;
  });

  it('should return: true traverse multiple arrays. whole object sub property exists', () => {
    var base = {
      'root': [
        {id: 1, value: 10},
        {
          id: 2, value: 20, sub: [
          {id: 'sub1', value: 'a'},
          {id: 'sub2', value: 'b'},
          {id: 'sub3', value: 'c'}
        ]
        },
        {id: 3, value: 30}]
    };

    jw(base).exists('root.[id=2].sub.[id=sub3].value').should.be.true;
  });
});

describe('j-walk tests:jwHelper', () => {

  it('should parse the dot notation selector query:single value', () => {
    var query = 'root';
    var expected = ['root'];
    var actual = worker.parseQuery(query);
    actual.should.deep.equal(expected);
  });

  it('should parse the dot notation selector query:nested', () => {
    var query = 'root.sub.nested';
    var expected = ['root', 'sub', 'nested'];
    var actual = worker.parseQuery(query);
    actual.should.deep.equal(expected);
  });

  it('should parse the dot notation selector query:single array', () => {
    var query = 'root.sub.[sub-a].nested';
    var expected = ['root', 'sub', ['sub-a'], 'nested'];
    var actual = worker.parseQuery(query);

    actual.should.deep.equal(expected);
  });

  it('should parse the dot notation selector query:nested array', () => {
    var query = 'root.sub.[sub-a].nested.[sub-b].last';
    var expected = ['root', 'sub', ['sub-a'], 'nested', ['sub-b'], 'last'];
    var actual = worker.parseQuery(query);
    actual.should.deep.equal(expected);
  });

  it('should throw exception: exception - unable to parse selector query for invalid criteria', () => {
    expect(() => {
      worker.parseQuery(42);
    }).to.throw('j-walk: invalid selector query format. expected: string');

    expect(() => {
      worker.parseQuery('');
    }).to.throw('j-walk: invalid selector query format. expected: string');

    expect(() => {
      worker.parseQuery({});
    }).to.throw('j-walk: invalid selector query format. expected: string');

    expect(() => {
      worker.parseQuery(undefined);
    }).to.throw('j-walk: invalid selector query format. expected: string');

    expect(() => {
      worker.parseQuery(null);
    }).to.throw('j-walk: invalid selector query format. expected: string');

    expect(() => {
      worker.parseQuery(['a', 'b', 'c']);
    }).to.throw('j-walk: invalid selector query format. expected: string');
  });
});

