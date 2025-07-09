angular.module('demoApp')
.controller('HomeController', function($scope, $rootScope) {
  $scope.message = "Welcome to the Home Page";
  $rootScope.$broadcast('homeViewLoaded');
});
