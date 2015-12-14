var chai = require('chai');
var expect = chai.expect;

var jw = require('./j-walk.js');

chai.should();

describe('get object value test', function () {

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

    it('should return the value: 42. single nested. root sibling value ignored but remains 84', function () {
        var base = {
            'root': {
                'nested-a': 42,
                'sibling-a': 84
            }
        };
        jw(base).get('root.nested-a').should.equal(42)
        base.root['sibling-a'].should.equal(84);
    });

    it('should return the value: 42. deeply nested. root sibling value ignored but remains 84', function () {
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
