angular.module('demoApp')
.factory('userService', function($q) {
  return {
    getUser: function(id) {
      const deferred = $q.defer();
      deferred.resolve({ id: id, name: 'John Doe', email: 'john@example.com' });
      return deferred.promise;
    }
  };
});
