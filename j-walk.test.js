var chai = require('chai');
var expect = chai.expect;
var jw = require('./j-walk.js');

chai.should();

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
