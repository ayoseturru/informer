/**
 * Created by ayoseturru on 14/04/2016.
 */
app.controller("Search", ['$scope', 'DatabaseReference', '$firebaseArray', 'User', '$q', 'PublicationsViewer', '$state', 'CareerPublicationsViewer', 'UserProfile', function ($scope, DatabaseReference, $firebaseArray, User, $q, PublicationsViewer, $state, CareerPublicationsViewer, UserProfile) {
  $scope.results = {};
  $scope.search = {filter: ""};
  $scope.profiles = {};
  $scope.tags = [];

  DatabaseReference.getReference("/tags").once("value", function (data) {
    data.forEach(function (tag) {
      $scope.tags.push("#" + tag.val().name);
    });
  });

  $firebaseArray(DatabaseReference.getReference("/universities/" + User.user.university + "/users")).$loaded().then(function (data) {
    $scope.users = data;
  });

  function requestProfile(userId) {
    if (!$scope.profiles[userId]) {
      UserProfile.loadProfile(userId).then(function (data) {
        $scope.profiles[userId] = data;
      });
    }
  }

  function updateUsersResult() {
    $scope.results = {};
    angular.forEach($scope.users, function (user) {
      if (user.completeName) {
        user.completeName.startsWith($scope.search.filter.toLocaleLowerCase().latinize()) && (user.$id != User.user.uid) ? ($scope.results[user.$id] = {name: user.completeName}) : false;
        requestProfile(user.$id);
      }
    });
  }

  $scope.updateResults = function () {
    $scope.search.filter.startsWith("#") ? $scope.filteringByHashtag = true : updateUsersResult() && ($scope.filteringByHashtag = false);
  };

  $scope.applyFilter = function (tag) {
    PublicationsViewer.setHashTag(tag);
    CareerPublicationsViewer.setHashTag(tag);
    $scope.search.filter = "";
    $scope.universityWall ? $state.go("app.home") : $state.go("app.careerHome");
    $scope.scrollTop();
  };
}]);
