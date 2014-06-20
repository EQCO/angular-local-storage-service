'use strict';
describe('$store', function() {
  describe('configure', function() {
    var storeProvider;

    beforeEach(function() {
      angular.module('test.store', function() {})
        .config(function($storeProvider) {
          storeProvider = $storeProvider;
        });

      module('local.storage', 'test.store');

      inject(function() {});
    });

    it('should default cookieFallback to true', function() {
      storeProvider.configure().cookieFallback.should.be.true;
    });

    it('should properly set cookiefallback to false', function() {
      storeProvider.configure({cookieFallback: false}).cookieFallback.should.be.false;
    });

    it('should default useSessionStorage to false', function() {
      storeProvider.configure().useSessionStorage.should.be.false;
    });

    it('should properly set useSessionStorage to true', function() {
      storeProvider.configure({useSessionStorage: true}).useSessionStorage.should.be.true;
    });
  });

  describe('$get', function() {
    beforeEach(module('local.storage'));

    it('should have a list of functions', inject(function($store) {
      var functions = ['set', 'get', 'remove', 'bind', 'unbind', 'has', 'clear'];
      for (var i in functions) {
        $store[functions[i]].should.be.a.Function;
      }
    }));

    describe('set', function() {
      it('should remove a key if set is called with an empty value', inject(function($store) {
        sinon.spy($store, 'remove');
        var result = $store.set('foo');
        $store.remove.calledOnce.should.be.true;
        (result === undefined).should.be.true;
      }));

      it('should transform the value into json and set the key', inject(function($store) {
        sinon.spy($store.getStorage(), 'setItem');
        sinon.spy(angular, 'toJson');
        var result = $store.set('foo', {bar: 'a'});
        $store.getStorage().setItem.calledOnce.should.be.true;
        angular.toJson.calledOnce.should.be.true;
        result.should.eql({bar: 'a'});
      }));

      it('should store info in the cookie store if the environment is not supported', inject(function($store, $cookieStore) {
        sinon.spy($cookieStore, 'put');
        $store.setSupported(false);
        var result = $store.set('foo', 'bar');
        $cookieStore.put.calledOnce.should.be.true;
        result.should.equal('bar');
      }));

      if('should store info in the memStorage if the environment is not supported and cookie fallback is disabled', function() {
        module('local.storage').configure(['$storeProvider', function($storeProvider) {
          $storeProvider.configure({cookieFallback: false});
        }]);
        inject(function($store) {
          var result = $store.set('foo', 'bar');
          $store.getMemstore()['foo'].should.equal('bar');
          result.should.equal('bar');
        });
      });
    });
  });
});