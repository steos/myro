import myro from '../src'

describe('myro', function() {

    it('matches routes', function() {
        const router = myro({
            '/foo/bar/:baz': 'foobarbaz',
            '/foo/bar': 'foobar'
        });

        expect(router('/foo/bar').name).toEqual('foobar');

        const bazMatch = router('/foo/bar/qux');
        expect(bazMatch.name).toEqual('foobarbaz');
        expect(bazMatch.params).toEqual({baz:'qux'});
    });

    it('works recursively', function() {
        const router = myro({
            '/foo': {
                name: 'foo',
                routes: {
                    '/bar': 'bar'
                }
            }
        });
        expect(router('/foo').name).toEqual('foo');
        expect(router('/foo/bar').name).toEqual('foo.bar');
    });

    it('is bidirectional', function() {
        const router = myro({
            '/foo': {
                name: 'foo',
                routes: {
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
                name: 'foo',
                props: {
                  item1: 'data1',
                  item2: 'data2'
                }
            }
        });
        const match = router('/foo');
        expect(match.props.item1).toEqual('data1');
        expect(match.props.item2).toEqual('data2');
    });

    it('does partial matching', function() {
        const router = myro({
            '/foo/bar': 'foo'
        });
        const match = router('/foo/bar/baz');
        expect(match.route).toBe(router.foo);
        expect(match.remaining).toEqual('/baz');
    });

    it('matches sequentially', function() {
        const router = myro({
            '/foo': 'foo',
            '/foo/bar': 'foobar'
        });
        expect(router('/foo/bar').name).toEqual('foo');
    });

    it('provides a parent chain', function() {
      const route = myro({
        '/a': {
          name: 'a',
          props: {foo: 'prop-a'},
          routes: {
            '/b': {
              name: 'b',
              props: {foo: 'prop-b'},
              routes: {
                '/c': {
                  name: 'c',
                  props: {foo: 'prop-c'},
                  routes: {
                    '/d': {
                      name: 'd',
                      props: {foo: 'prop-d'}
                    }
                  }
                }
              }
            }
          }
        }
      })
      const match = route('/a/b/c/d')
      expect(match.props.foo).toEqual('prop-d')
      expect(match.parent.props.foo).toEqual('prop-c')
      expect(match.parent.parent.props.foo).toEqual('prop-b')
      expect(match.parent.parent.parent.props.foo).toEqual('prop-a')
      expect(match.parent.parent.parent.parent).toEqual(null)
    })

    it('merges params from parent and child', function() {
      const route = myro({
        '/foo/:x': {
          name: 'foo',
          routes: {
            '/bar/:y': 'bar'
          }
        }
      })
      expect(route('/foo/x-val/bar/y-val').params).toEqual({x: 'x-val', y: 'y-val'})
      expect(route.foo({x: 'the-x'})).toEqual('/foo/the-x')
      expect(route.foo.bar({x: 'the-x', y: 'the-y'})).toEqual('/foo/the-x/bar/the-y')
    })

    it('overwrites parent params with child params', function() {
      const route = myro({
        '/foo/:x': {
          name: 'foo',
          routes: {
            '/bar/:x': 'bar'
          }
        }
      })
      const match = route('/foo/foo-val/bar/bar-val')
      expect(match.params.x).toEqual('bar-val')
      expect(match.parent.params.x).toEqual('foo-val')
    })

    it('matches root with empty string', function() {
      const route = myro({
        '': {
          name: 'foo',
          routes: {
            '/bar': 'bar'
          }
        }
      })
      expect(route('/').name).toEqual('foo')
      expect(route('/bar').name).toEqual('foo.bar')
    })
});
