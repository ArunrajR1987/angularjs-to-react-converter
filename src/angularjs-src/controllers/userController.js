angular.module('demoApp')
.controller('UserController', function($scope, $routeParams, userService, $rootScope) {
  $scope.userId = $routeParams.id;
  $scope.user = {};

  userService.getUser($scope.userId).then(function(data) {
    $scope.user = data;
  });

  $rootScope.$on('homeViewLoaded', function() {
    console.log("UserController received event from Home");
  });
});
