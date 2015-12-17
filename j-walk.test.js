var chai = require('chai');
var expect = chai.expect;
var jw = require('./j-walk.js').jw;
var engine = new require('./j-walk.js').jwEngine();
var exception = require('./j-walk.js').jwException;

chai.should();

describe('j-walk tests:init', function () {
    it('should throw exception: jwException - unable to parse selector query for invalid criteria', function () {
        expect(function () {
            jw(42).get('whatever')
        }).to.throw(new exception('j-walk: invalid selector. expected: object'));

        expect(function () {
            jw('').get('whatever')
        }).to.throw(new exception('j-walk: invalid selector. expected: object'));

        expect(function () {
            jw(true).get('whatever')
        }).to.throw(new exception('j-walk: invalid selector. expected: object'));

        expect(function () {
            jw(undefined).get('whatever')
        }).to.throw(new exception('j-walk: invalid selector. expected: object'));

        expect(function () {
            jw(null).get('whatever')
        }).to.throw(new exception('j-walk: invalid selector. expected: object'));

        expect(function () {
            jw(['a', 'b', 'c']).get('whatever')
        }).to.throw(new exception('j-walk: invalid selector. expected: object'));
    })
});

describe('j-walk tests:get', function () {

    it('should return the value: 42', function () {
        var base = {'root': 42};
        jw(base).get('root').should.equal(42);
    });

    it('should return the value: [object]', function () {
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
        }

        jw(base).get('root').should.deep.equal(expected);
    });

    it('should return the value: 42. single nested. no siblings', function () {
        var base = {
            'root': {
                'nested-a': 42
            }
        };
        jw(base).get('root.nested-a').should.equal(42);
    });

    it('should return the value: [object]. single nested. no siblings', function () {
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
        }
        jw(base).get('root.value').should.deep.equal(expected);
    });

    it('should return the value: 42. deeply nested. no siblings', function () {
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

    it('should return the value: 42. single nested. root sibling value ignored - remains 84', function () {
        var base = {
            'root': {
                'nested-a': 42,
                'sibling-a': 84
            }
        };
        jw(base).get('root.nested-a').should.equal(42)
        base.root['sibling-a'].should.equal(84);
    });

    it('should return the value: 42. deeply nested. root sibling value ignored - remains 84', function () {
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
        jw(base).get('root.nested-a.nested-b.nested-c').should.equal(42)
        base.root['sibling-a'].should.equal(84);
    });

    it('should return the value: undefined. selector specified for empty object', function () {
        var base = {};
        expect(jw(base).get('root.nested-a')).to.be.undefined;
    });

    it('should return the value: undefined. single additional selector not defined on object', function () {
        var base = {
            'root': {
                'nested-a': {},
            }
        };
        expect(jw(base).get('root.nested-a.nested-b')).to.be.undefined;
    });

    it('should return the value: undefined. deeply nested selector not defined on object', function () {
        var base = {
            'root': {
                'nested-a': {},
            }
        };
        expect(jw(base).get('root.nested-a.nested-b.nested-c.nested-d')).to.be.undefined;
    });
});

describe('j-walk tests:get:array', function () {
    it('should return the value: 42. single nested array selector', function () {

        var base = {
            'root': [
                {'sub-a': 26},
                {'sub-b': 42},
                {'sub-c': 84}
            ]
        };

        jw(base).get('root.[sub-b]').should.equal(42);
    });

    it('should return the value: 42. single nested array selector. nested single value', function () {

        var base = {
            'root': [
                {'sub-a': 26},
                {'sub-b': {'target': 42}},
                {'sub-c': 84}
            ]
        };

        jw(base).get('root.[sub-b].target').should.equal(42);
    });

    it('should return the value: 42. single nested array selector. nested object value', function () {

        var base = {
            'root': [
                {'sub-a': 26},
                {'sub-b': {'target': 42}},
                {'sub-c': 84}
            ]
        };

        var expected = {'target': 42}

        jw(base).get('root.[sub-b]').should.deep.equal(expected);
    });

    it('should return the value: 42. multiple nested sibling arrays', function () {

        var base = {
            'root': [
                {'sub-a': [{'deep-a': 10}, {'deep-b': 20}, {'deep-c': 30}]},
                {'sub-b': [{'deep-a': 40}, {'deep-b': 42}, {'deep-d': 60}]},
                {'sub-c': [{'deep-a': 70}, {'deep-b': 80}, {'deep-e': 90}]}
            ],
            'irrelevant': [2, 3, 6]
        };

        jw(base).get('root.[sub-b].[deep-b]').should.equal(42);
    });

    // this could be changed later on to return all matches, or traverse further - but will return first found for now
    it('should return the value: 42, in the first array named instance if array contains duplicate sibling property names', function () {

        var base = {
            'root': [
                {'sub-a': {'same': 42}},
            ]
        };

        jw(base).get('root.[sub-a].same').should.equal(42);
        jw(base).get('root.[sub-a].same').should.not.equal(84);
        jw(base).get('root.[sub-a].same').should.not.equal('no way');
    });

    it('should return the value: 42, traversing multiple nested arrays', function () {

        var base = {
            'root': {
                'parent-a': [
                    {'child-a': {}},
                    {'child-b': [
                        {'grandchild-a': 21},
                        {'grandchild-b': 42},
                        {'grandchild-c': 84}]
                    }],
                'parent-b': {}
            }
        };

        jw(base).get('root.parent-a.[child-b].[grandchild-b]').should.equal(42);

    });
});

describe('j-walk tests:set', function () {

    it('should set the root value: 42. empty object - undefined property', function () {
        var base = {};

        jw(base).set('root', 42)

        base.root.should.equal(42);
    });

    it('should set the immediate nested value: 42. empty object - undefined property', function () {
        var base = {};

        jw(base).set('root.nested', 42)

        base.root.nested.should.equal(42);
    });

    it('should set the deeply nested value: 42. empty object - undefined property', function () {
        var base = {};

        jw(base).set('root.nested.sub', 42);

        base.root.nested.sub.should.equal(42);
    });

    it('should set the immediate nested value: 42. object - pre-defined property', function () {
        var base = {
            nested: {}
        };

        jw(base).set('root.nested', 42);

        base.root.nested.should.equal(42);
    });

    it('should set the deeply nested value: 42. object - pre-defined property', function () {
        var base = {
            nested: {
                sub: {}
            }
        };

        jw(base).set('root.nested.sub', 42);

        base.root.nested.sub.should.equal(42);
    });

    it('should set the immediate nested value: 42. object - pre-defined target property. defined sibling. ignore sibling value of 84', function () {
        var base = {
            root: {
                sub: {},
                ignored: 84
            }
        };

        jw(base).set('root.sub', 42)

        base.root.sub.should.equal(42);
        base.root.ignored.should.equal(84);
    });

    it('should set the deeply nested value: 42. object - pre-defined target property. defined sibling. ignore sibling value of 84', function () {
        var base = {
            root: {
                sub: {
                    inner: {}
                },
                ignored: 84
            }
        };

        jw(base).set('root.sub.inner', 42)

        base.root.sub.inner.should.equal(42);
        base.root.ignored.should.equal(84);
    });

    it('should set the immediate nested value: 42. object - pre-defined target property. defined sibling. ignore sibling value of 84', function () {
        var base = {
            root: {
                ignored: 84
            }
        };

        jw(base).set('root.sub', 42)

        base.root.sub.should.equal(42);
        base.root.ignored.should.equal(84);
    });

    it('should set the deeply nested value: 42. object - pre-defined target property. defined sibling. ignore sibling value of 84', function () {
        var base = {
            root: {
                ignored: 84
            }
        };

        jw(base).set('root.sub.inner', 42)

        base.root.sub.inner.should.equal(42);
        base.root.ignored.should.equal(84);
    });

    it('should set the immediate nested value: [object]. object - undefined target property. defined sibling. ignore sibling value of 84', function () {
        var base = {
            root: {
                ignored: 84
            }
        };

        var value = {
            val: 42
        }

        jw(base).set('root.sub', value)

        base.root.sub.should.deep.equal(value);
        base.root.ignored.should.equal(84);
    });

    it('should set the deeply nested value: [object]. object - undefined target property. defined sibling. ignore sibling value of 84', function () {
        var base = {
            root: {
                ignored: 84
            }
        };

        var value = {
            nested: {
                val: 42
            }
        }

        jw(base).set('root.sub', value)

        base.root.sub.should.deep.equal(value);
        base.root.ignored.should.equal(84);
    });

    it('should set the immediate nested value: [object]. object - pre-defined target property. defined sibling. ignore sibling value of 84', function () {
        var base = {
            root: {
                ignored: 84
            },
            sub: {
                val: {}
            }
        };

        var value = {
            val: 42
        }

        jw(base).set('root.sub', value)

        base.root.sub.should.deep.equal(value);
        base.root.ignored.should.equal(84);
    });
});

describe('j-walk tests:set:array', function (){
    it('should set specified array value: {"value": 42}. undefined nested property. no siblings', function () {
        var base = {
            'root': {
            }
        };

        jw(base).set('root.container.[nested]', 42)

        base.root.container[0].nested.should.equal(42);
        //regress
        jw(base).get('root.container.[nested]').should.equal(42)
    });

    it('should set specified array value: {"value": 42}. defined nested property. no siblings', function () {
        var base = {
            'root': {
                'container': []
            }
        };

        jw(base).set('root.container.[nested]', 42)

        base.root.container[0].nested.should.equal(42);
        //regress
        jw(base).get('root.container.[nested]').should.equal(42)
    });
});

describe('j-walk tests:exists', function () {

    it('should return:true - defined property', function () {
        var base = {'root': null};

        jw(base).exists('root').should.be.true;
    });

    it('should return:true - defined property:nested', function () {
        var base = {
            'root': {
                'nested': {
                    'deeper': null
                }
            }
        };

        jw(base).exists('root.nested.deeper').should.be.true;
    });

    it('should return:true - defined property:nested - shallow target - complex object', function () {
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

    it('should return:false - undefined property: object root', function () {
        var base = {};
        jw(base).exists('root').should.be.false;
    });

    it('should return:false - undefined property: single nested', function () {
        var base = {
            'root': {}
        };
        jw(base).exists('root.sub').should.be.false;
    });

    it('should return:false - undefined property: deeply nested', function () {
        var base = {
            'root': {
                'sub': {}
            }
        };
        jw(base).exists('root.sub.deeper').should.be.false;
    });
});

describe('j-walk tests:engine', function () {

    it('should parse the dot notation selector query:single value', function () {
        var query = 'root'
        var expected = ['root']
        var actual = engine.parseQuery(query)
        actual.should.deep.equal(expected);
    });

    it('should parse the dot notation selector query:nested', function () {
        var query = 'root.sub.nested'
        var expected = ['root', 'sub', 'nested']
        var actual = engine.parseQuery(query)
        actual.should.deep.equal(expected);
    });

    it('should parse the dot notation selector query:single array', function () {
        var query = 'root.sub.[sub-a].nested'
        var expected = ['root', 'sub', ['sub-a'], 'nested']
        var actual = engine.parseQuery(query)

        actual.should.deep.equal(expected);
    });

    it('should parse the dot notation selector query:nested array', function () {
        var query = 'root.sub.[sub-a].nested.[sub-b].last'
        var expected = ['root', 'sub', ['sub-a'], 'nested', ['sub-b'], 'last']
        var actual = engine.parseQuery(query)
        actual.should.deep.equal(expected);
    });

    it('should create a nested object - initialize target value with empty object', function () {

        var criteria = [{'property': 'root',  'isArray': false}, {'property': 'sub',  'isArray': false}, {'property': 'nested',  'isArray': false}]

        var expected = {
            'root': {
                'sub': {
                    'nested': {}
                }
            }
        };

        var actual = engine.constructNestedObject(criteria)

        actual.should.deep.equal(expected);
    });

    it('should create a nested object - initialize object with target property and value: [nested]:42', function () {

        var criteria = [{'property': 'root',  'isArray': false}, {'property': 'sub',  'isArray': false}, {'property': 'nested',  'isArray': false}]

        var expected = {
            'root': {
                'sub': {
                    'nested': 42
                }
            }
        };

        var actual = engine.constructNestedObject(criteria, 42)

        actual.should.deep.equal(expected);
    });

    it('should throw exception: jwException - unable to parse selector query for invalid criteria', function () {
        expect(function () {
            engine.parseQuery(42)
        }).to.throw(new exception('j-walk: invalid selector query format. expected: string'));

        expect(function () {
            engine.parseQuery('')
        }).to.throw(new exception('j-walk: invalid selector query format. expected: string'));

        expect(function () {
            engine.parseQuery({})
        }).to.throw(new exception('j-walk: invalid selector query format. expected: string'));

        expect(function () {
            engine.parseQuery(undefined)
        }).to.throw(new exception('j-walk: invalid selector query format. expected: string'));

        expect(function () {
            engine.parseQuery(null)
        }).to.throw(new exception('j-walk: invalid selector query format. expected: string'));

        expect(function () {
            engine.parseQuery(['a', 'b', 'c'])
        }).to.throw(new exception('j-walk: invalid selector query format. expected: string'));
    })
});
