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
      .state('public', {
        url: '/public',
        controller: 'jwtController',
        templateUrl: '/partials/public.html'
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
      // track the state the user wants to go to;
      $rootScope.toState = toState;
      $rootScope.toStateParams = toStateParams;
      // if the principal is resolved, do an
      // authorization check immediately. otherwise,
      // it'll be done when the state it resolved.
      if (principal.isIdentityResolved()) authorization.authorize();
      });
    }
  ])

  // principal stores user identity
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
          // otherwise, jwtController sets $scope.user to localStorage.user
          // if localStorage.user exists
          this.authenticate(null);
          deferred.resolve(_identity);
          return deferred.promise;
        }
      };
    }
  ])

  // Second, you need a service that checks the state the user wants to go to, makes sure they're logged in, and then does a role check.
  // If they are not authenticated, send them to the signin page.
  // If they are authenticated, but fail a role check, send them to an access denied page.
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
                  // user is not authenticated. Stow
                  // Store the state to which they were navigating
                  // before sending them to signin state
                  $rootScope.returnToState = $rootScope.toState;
                  $rootScope.returnToStateParams = $rootScope.toStateParams;
                  // now, send them to the signin state
                  // so they can log in
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
      delete $rootScope.returnToStateParams;
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
