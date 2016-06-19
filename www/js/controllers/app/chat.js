/**
 * Created by Ayose on 10/04/2016.
 */
app.controller("Chat", ['$scope', 'User', '$stateParams', "$timeout", "$ionicScrollDelegate", 'DatabaseArray', '$stateParams', '$q', 'DatabaseReference', 'DateHelper', 'AppPushNotifications', '$state', function ($scope, User, $stateParams, $timeout, $ionicScrollDelegate, DatabaseArray, $stateParams, $q, DatabaseReference, DateHelper, AppPushNotifications, $state) {
  $scope.recipientUser = $stateParams.user;
  $scope.recipientUserId = $stateParams.userId;
  !$stateParams.user ? $state.go("app.messages", {}, {reload: true}) : false;
  $scope.User = User;
  $scope.data = {};
  var messagesLoaded = false;

  getMessages().then(function (data) {
    $scope.messages = data;
    messagesLoaded = true;
    $timeout(function () {
      $ionicScrollDelegate.$getByHandle("userMessageScroll").scrollBottom(true);
    }, 300);
  });

  DatabaseReference.getReference("/users/" + User.user.uid + "/conversations/" + $scope.recipientUserId).on('child_added', function (childSnapshot, prevChildKey) {
    messagesLoaded ? $ionicScrollDelegate.$getByHandle("userMessageScroll").scrollBottom(true) : false;
  });

  function getMessages() {
    var q = $q.defer();

    DatabaseArray.getArray("/users/" + User.user.uid + "/conversations/" + $scope.recipientUserId).$loaded(function (data) {
      q.resolve(data);
    });

    return q.promise;
  }

  $scope.sendMessage = function () {
    var message = $scope.data.message;
    if (!message) return;
    var currentDate = new Date() + "";

    $scope.messages.$add({
      messageIsMine: true,
      message: message,
      date: currentDate
    }).then(function (reference) {
      DatabaseReference.getReference("/users/" + $scope.recipientUserId + "/conversations/" + User.user.uid).push({
        message: message,
        date: currentDate,
        messageIsMine: false
      });
      AppPushNotifications.sendMessageNotification(User.user.uid, $scope.recipientUserId, message);
    });

    delete $scope.data.message;
    $ionicScrollDelegate.$getByHandle("userMessageScroll").scrollBottom(true);
  };

  $scope.inputUp = function () {
    $timeout(function () {
      $ionicScrollDelegate.$getByHandle("userMessageScroll").scrollBottom(true);
    }, 300);
  };

  $scope.inputDown = function () {
    $ionicScrollDelegate.resize();
  };

  $scope.closeKeyboard = function () {
    // cordova.plugins.Keyboard.close();
  };

  $scope.formatDate = function (date) {
    return DateHelper.formatDate(date);
  }
}]);
