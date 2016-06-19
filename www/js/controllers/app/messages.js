/**
 * Created by Ayose on 10/04/2016.
 */

app.controller("Messages", ['$scope', 'User', 'DatabaseArray', '$q', 'Alert', 'DatabaseReference', 'UserProfile', function ($scope, User, DatabaseArray, $q, Alert, DatabaseReference, UserProfile) {
  $scope.conversationsUsers = {};
  $scope.conversationsLoaded = false;

  function loadProfileImages() {
    angular.forEach($scope.conversations, function (user) {
      $scope.conversationsUsers[user.$id] = {};
      UserProfile.loadProfile(user.$id).then(function (userProfile) {
        $scope.conversationsUsers[user.$id] = userProfile;
      });
    });
  }

  getConversations().then(function (conversations) {
    $scope.conversations = conversations;
    $scope.conversationsLoaded = true;
    loadProfileImages();
  }, function (error) {
    Alert.show("Error", errors);
  });

  function getConversations() {
    var q = $q.defer();

    DatabaseArray.getArray("/users/" + User.user.uid + "/conversations").$loaded().then(function (conversations) {
      q.resolve(conversations);
    }).catch(function (errors) {
      q.reject(errors);
    });

    return q.promise;
  }

  $scope.removeConversation = function (conversationId) {
    $scope.conversations.$remove(conversationId);
  };

  $scope.conversationAdded = function (userId) {
    UserProfile.loadProfile(userId).then(function (userProfile) {
      if (!$scope.conversationsUsers[userId]) {
        $scope.conversationsUsers[userId] = userProfile;
      }
    });
  };

}]);
