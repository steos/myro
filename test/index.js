var myro = require('../src/index');

describe('myro', function() {

    it('matches routes', function() {
        var router = myro({
            '/foo/bar/:baz': 'foobarbaz',
            '/foo/bar': 'foobar'
        });

        expect(router('/foo/bar').$name).toEqual('foobar');

        var bazMatch = router('/foo/bar/qux');
        expect(bazMatch.$name).toEqual('foobarbaz');
        expect(bazMatch.$params).toEqual({baz:'qux'});
    });

    it('works recursively', function() {
        var router = myro({
            '/foo': {
                $name: 'foo',
                $routes: {
                    '/bar': 'bar'
                }
            }
        });
        expect(router('/foo').$name).toEqual('foo');
        expect(router('/foo/bar').$name).toEqual('foo.bar');
    });

    it('is bidirectional', function() {
        var router = myro({
            '/foo': {
                $name: 'foo',
                $routes: {
                    '/bar/:baz': 'bar'
                }
            }
        });

        expect(router.foo()).toEqual('/foo');
        expect(router.foo.bar({baz:'qux'})).toEqual('/foo/bar/qux');
    });

    it('works with arbitrary payloads', function() {
        var router = myro({
            '/foo': {
                $name: 'foo',
                item1: 'data1',
                item2: 'data2'
            }
        });
        var match = router('/foo');
        expect(match.item1).toEqual('data1');
        expect(match.item2).toEqual('data2');
    });

    it('does partial matching', function() {
        var router = myro({
            '/foo/bar': 'foo'
        });
        var match = router('/foo/bar/baz');
        expect(match.$route).toBe(router.foo);
        expect(match.$remaining).toEqual('/baz');
    });

    it('matches sequentially', function() {
        var router = myro({
            '/foo': 'foo',
            '/foo/bar': 'foobar'
        });
        expect(router('/foo/bar').$name).toEqual('foo');
    });

});
