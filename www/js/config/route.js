app.run(function ($rootScope, $state, User, $localStorage) {
  function restoreUser() {
    var currentUser = $localStorage.getObject("User");
    for (var property in currentUser.user) {
      User.user[property] = currentUser.user[property];
    }
  }

  $localStorage.getObject("user") ? restoreUser() : false;

  $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
    if (toState.authenticate && !User.user.logged) {
      $state.transitionTo("welcome");
      event.preventDefault();
    } else if (toState.controller == "Access" && User.user.logged && User.user.university) {
      $state.transitionTo("app.home");
      event.preventDefault();
    }
  });
});

app.config(function ($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state("welcome", {
      url: "/",
      cache: false,
      templateUrl: "views/access/welcome.html",
      controller: "Access"
    })
    .state('signUp', {
      url: '/sign_up',
      templateUrl: 'views/access/sign_up.html',
      controller: 'Access',
      params: {
        slide: 0,
        facebookUser: null
      }
    })
    .state('app', {
      cache: false,
      url: "/app",
      abstract: true,
      controller: "Main",
      templateUrl: "views/app/app.html",
      authenticate: true
    })
    .state('app.home', {
      url: "/home",
      views: {
        'appHome': {
          templateUrl: "views/app/tabs/home.html",
          controller: 'Home'
        }
      },
      params: {
        university: true
      },
      authenticate: true
    })
    .state('app.careerHome', {
      url: "/career_home",
      views: {
        'appHome': {
          templateUrl: "views/app/tabs/careerHome.html",
          controller: 'CareerHome'
        }
      },
      params: {
        university: true,
        again: false
      },
      authenticate: true
    })
    .state('app.comments', {
      url: "/comments",
      views: {
        'appHome': {
          templateUrl: "views/app/tabs/comments.html",
          controller: 'Comments'
        }
      },
      params: {
        comments: false,
        owner: false,
        publicationId: false
      },
      authenticate: true
    })
    .state('app.likes', {
      url: "/likes",
      cache: false,
      views: {
        'appHome': {
          templateUrl: "views/app/tabs/likes.html",
          controller: 'Likes'
        }
      },
      params: {
        likes: false
      },
      authenticate: true
    })
    .state('app.messages', {
      url: "/messages",
      views: {
        'appMessages': {
          templateUrl: "views/app/tabs/messages.html",
          controller: "Messages"
        }
      },
      authenticate: true
    })
    .state('app.new', {
      url: "/new",
      views: {
        'appNew': {
          templateUrl: "views/app/tabs/new.html",
          controller: 'New'
        }
      },
      authenticate: true
    })
    .state('app.search', {
      url: "/search",
      views: {
        'appSearch': {
          templateUrl: "views/app/tabs/search.html",
          controller: "Search"
        }
      },
      authenticate: true
    })
    .state('app.notifications', {
      url: "/notifications",
      views: {
        'appNotifications': {
          templateUrl: "views/app/tabs/notifications.html",
          controller: "Notifications"
        }
      },
      authenticate: true
    })
    .state('app.notificationLikes', {
      url: "/likes",
      cache: false,
      views: {
        'appNotifications': {
          templateUrl: "views/app/tabs/likes.html",
          controller: 'Likes'
        }
      },
      params: {
        likes: false
      },
      authenticate: true
    })
    .state('app.notificationComments', {
      url: "/comments",
      views: {
        'appNotifications': {
          templateUrl: "views/app/tabs/comments.html",
          controller: 'Comments'
        }
      },
      params: {
        comments: false,
        owner: false,
        publicationId: false
      },
      authenticate: true
    })
    .state('app.profileLikes', {
      url: "/likes",
      cache: false,
      views: {
        'appProfile': {
          templateUrl: "views/app/tabs/likes.html",
          controller: 'Likes'
        }
      },
      params: {
        likes: false
      },
      authenticate: true
    })
    .state('app.profileComments', {
      url: "/comments",
      views: {
        'appProfile': {
          templateUrl: "views/app/tabs/comments.html",
          controller: 'Comments'
        }
      },
      params: {
        comments: false,
        owner: false,
        publicationId: false
      },
      authenticate: true
    })
    .state("app.publication", {
      url: "/publication",
      views: {
        'appNotifications': {
          templateUrl: "views/app/tabs/publication.html",
          controller: "SinglePublication"
        }
      },
      params: {
        publicationId: false
      },
      authenticate: true
    })
    .state('app.profile', {
      url: "/profile",
      views: {
        'appProfile': {
          templateUrl: "views/app/tabs/profile.html",
          controller: "Profile"
        }
      },
      authenticate: true
    })
    .state("app.userProfile", {
      url: "/user",
      views: {
        'appHome': {
          templateUrl: "views/app/tabs/userProfile.html",
          controller: "UserProfile"
        }
      },
      params: {
        user: false
      },
      authenticate: true
    })
    .state("app.conversation", {
      url: "/conversation",
      views: {
        'appMessages': {
          templateUrl: "views/app/tabs/conversation.html",
          controller: "Chat"
        }
      },
      params: {
        user: false,
        userId: false
      },
      authenticate: true
    });

  $urlRouterProvider.otherwise("/");

});
