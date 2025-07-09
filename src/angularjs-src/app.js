angular.module('demoApp', ['ngRoute'])
.config(function($routeProvider) {
  $routeProvider
    .when('/home', {
      templateUrl: 'views/home.html',
      controller: 'HomeController'
    })
    .when('/user/:id', {
      templateUrl: 'views/user.html',
      controller: 'UserController'
    })
    .otherwise({ redirectTo: '/home' });
});
