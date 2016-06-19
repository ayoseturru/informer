/**
 * Created by ayoseturru on 16/04/2016.
 */
app.controller("Comments", ['$scope', 'User', 'DatabaseReference', '$firebaseArray', '$stateParams', '$q', 'UserProfile', '$state', 'AppPushNotifications', function ($scope, User, DatabaseReference, $firebaseArray, $stateParams, $q, UserProfile, $state, AppPushNotifications) {
  $scope.comments = $stateParams.comments;
  $scope.usersProfile = [];
  $scope.newComment = {comment: ""};
  $scope.User = User;
  $scope.owner = $stateParams.owner;
  $scope.publicationId = $stateParams.publicationId;

  loadComments();
  (!$scope.comments) || (!$scope.owner) || (!$scope.publicationId) ? $state.go("app.home") : false;

  function loadComments() {
    angular.forEach($scope.comments, function (comment) {
      if (!$scope.usersProfile[comment.user]) {
        UserProfile.loadProfile(comment.user).then(function (data) {
          $scope.usersProfile[comment.user] = data;
        });
      }
    });
  }

  $scope.addComment = function () {
    if ($scope.newComment.comment) {
      $scope.comments.$add({
        comment: $scope.newComment.comment,
        date: new Date() + "",
        user: User.user.uid
      });
      $scope.newComment.comment = "";
      loadComments();
      $scope.owner != User.user.uid ? AppPushNotifications.sendCommentNotification($scope.owner, $scope.publicationId) : false;
    }
  };

  $scope.removeComment = function (commentId) {
    $scope.comments.$remove(commentId);
  };

  $scope.$watch('comments.length', function (newVal, oldVal) {
    loadComments();
  }, true);
}]);
