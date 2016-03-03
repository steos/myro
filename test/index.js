import myro from '../src'

describe('myro', function() {

    it('matches routes', function() {
        const router = myro({
            '/foo/bar/:baz': 'foobarbaz',
            '/foo/bar': 'foobar'
        });

        expect(router('/foo/bar').$name).toEqual('foobar');

        const bazMatch = router('/foo/bar/qux');
        expect(bazMatch.$name).toEqual('foobarbaz');
        expect(bazMatch.$params).toEqual({baz:'qux'});
    });

    it('works recursively', function() {
        const router = myro({
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
        const router = myro({
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
        const router = myro({
            '/foo': {
                $name: 'foo',
                item1: 'data1',
                item2: 'data2'
            }
        });
        const match = router('/foo');
        expect(match.item1).toEqual('data1');
        expect(match.item2).toEqual('data2');
    });

    it('does partial matching', function() {
        const router = myro({
            '/foo/bar': 'foo'
        });
        const match = router('/foo/bar/baz');
        expect(match.$route).toBe(router.foo);
        expect(match.$remaining).toEqual('/baz');
    });

    it('matches sequentially', function() {
        const router = myro({
            '/foo': 'foo',
            '/foo/bar': 'foobar'
        });
        expect(router('/foo/bar').$name).toEqual('foo');
    });

});
