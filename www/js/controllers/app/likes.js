/**
 * Created by ayoseturru on 17/04/2016.
 */
app.controller("Likes", ['$scope', 'User', 'DatabaseReference', '$firebaseArray', '$state', '$stateParams', 'UserProfile', function ($scope, User, DatabaseReference, $firebaseArray, $state, $stateParams, UserProfile) {
  $scope.likes = $stateParams.likes;
  $scope.usersProfile = {};
  $scope.User = User;
  !$scope.likes ? $state.go("app.home") : false;

  loadLikes();

  function loadLikes() {
    angular.forEach($scope.likes, function (like) {
      if (!$scope.usersProfile[like.$id]) {
        UserProfile.loadProfile(like.$id).then(function (data) {
          $scope.usersProfile[like.$id] = data;
        });
      }
    });
  }

  $scope.$watch('likes.length', function (newVal, oldVal) {
    loadLikes();
  }, true);

}]);

