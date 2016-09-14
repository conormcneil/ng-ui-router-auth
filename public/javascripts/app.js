var app = angular.module("ngApp",['ui.router']);

app

  .config(function($stateProvider, $urlRouterProvider, $httpProvider, $locationProvider) {
    $httpProvider.interceptors.push('jwtInterceptor');
    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise('/');
    $stateProvider
      .state('home', {
        url: '/',
        templateUrl: '/partials/home.html'
      })
      .state('protected', {
        url: '/protected',
        controller: 'jwtController',
        data: {
          roles: ['admin']
        },
        templateUrl: '/partials/protected.html'
      })
      .state('accessdenied', {
        url: '/accessdenied',
        controller: 'jwtController',
        templateUrl: '/partials/accessdenied.html'
      })
      .state('signin', {
        url: '/signin',
        controller: 'jwtController',
        templateUrl: '/partials/signin.html'
      })
  })

  .service('jwtInterceptor', function jwtInterceptor() {
    return {
      request: function(config) {
        if (localStorage.jwt) {
          config.headers.Authorization = 'Bearer ' + localStorage.jwt;
        }
        return config;
      }
    };
  })

  .run(['$rootScope', '$state', '$stateParams', 'authorization', 'principal', function($rootScope, $state, $stateParams, authorization, principal) {
    $rootScope.$on('$stateChangeStart', function(event, toState, toStateParams) {
      // store the state to which user wanted to go
      $rootScope.toState = toState;
      $rootScope.toStateParams = toStateParams;
      // if the principal is resolved, do an
      // authorization check immediately. otherwise,
      // it'll be done when the state it resolved.
      if (principal.isIdentityResolved()) authorization.authorize();
      });
    }
  ])

  // service to store the user's identity
  .factory('principal', ['$q', '$http', '$timeout',
    function($q, $http, $timeout) {
      var _identity = undefined,
        _authenticated = false;
      return {
        isIdentityResolved: function() {
          return angular.isDefined(_identity);
        },
        isAuthenticated: function() {
          return _authenticated;
        },
        isInRole: function(role) {
          if (!_authenticated || !_identity.roles) return false;
          return _identity.roles.indexOf(role) != -1;
        },
        isInAnyRole: function(roles) {
          if (!_authenticated || !_identity.roles) return false;
          for (var i = 0; i < roles.length; i++) {
            if (this.isInRole(roles[i])) return true;
          }
          return false;
        },
        authenticate: function(identity) {
          _identity = identity;
          _authenticated = identity != null;
        },
        identity: function(force) {
          var deferred = $q.defer();
          if (force === true) _identity = undefined;
          if (angular.isDefined(_identity)) {
            deferred.resolve(_identity);
            return deferred.promise;
          }
          this.authenticate(null);
          deferred.resolve(_identity);
          return deferred.promise;
        }
      };
    }
  ])

  // service that checks the state the user wants to go to, makes sure they're logged in and then does a role check
  .factory('authorization', ['$rootScope', '$state', 'principal',
    function($rootScope, $state, principal) {
      return {
        authorize: function() {
          return principal.identity()
            .then(function() {
              var isAuthenticated = principal.isAuthenticated();
              if ($rootScope.toState.data && $rootScope.toState.data.roles && $rootScope.toState.data.roles.length > 0 && !principal.isInAnyRole($rootScope.toState.data.roles))
              {
                if (isAuthenticated) {
                  // user is signed in but not
                  // authorized for desired state
                  $state.go('accessdenied');
                } else {
                  $rootScope.returnToState = $rootScope.toState;
                  $rootScope.returnToStateParams = $rootScope.toStateParams;
                  // send to the signin state
                  $state.go('signin');
                }
              }
            });
        }
      };
    }
  ])

  .controller('jwtController',['$rootScope','$scope','$http','principal','authorization','$state',function($rootScope,$scope,$http,principal,authorization,$state) {
    if($rootScope.returnToState && $rootScope.returnToState.name === $state.current.name) {
      delete $rootScope.returnToState;
      delete $rootScope.returnToStateParams;l
    }
    // Check authentication & authorization here:
    principal.identity();
    $scope.signin = function(user) {
      var userRole = {user:user}
      $http.post('/users/signin',userRole).then(function(response) {
        $scope.user = response.data.user;
        localStorage.user = JSON.stringify(response.data.user);
        localStorage.jwt = JSON.stringify(response.data.token);
        principal.authenticate(response.data.user);
        if ($rootScope.returnToState) {
          $state.go($rootScope.returnToState)
        }
      });
    };
    $scope.signout = function() {
      principal.identity(true);
      principal.authenticate(null);
      delete localStorage.jwt;
      delete localStorage.user;
      delete $scope.user;
      $state.go('home');
    }
    // if user is logged in, set to $scope.user
    if (localStorage.user) {
      $scope.user = JSON.parse(localStorage.user);
      $scope.signin($scope.user.name.toLowerCase());
    }
  }]);
