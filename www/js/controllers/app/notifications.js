/**
 * Created by ayoseturru on 23/04/2016.
 */
app.controller("Notifications", ['$scope', 'User', 'DatabaseReference', '$firebaseArray', 'UserProfile', '$state', '$timeout', function ($scope, User, DatabaseReference, $firebaseArray, UserProfile, $state, $timeout) {
  $scope.notifications = [];
  var scrollRef = new Firebase.util.Scroll(DatabaseReference.getReference("/users/" + User.user.uid + "/notifications"), '$priority');
  $scope.notifications = $firebaseArray(scrollRef);
  $scope.userProfiles = {};
  scrollRef.scroll.next(3);

  $scope.$watch('notifications.length', function (newVal, oldVal) {
    $scope.loaded = true;
    if (!newVal) return;
    angular.forEach($scope.notifications, function (notification) {
      UserProfile.loadProfile(notification.userId).then(function (profile) {
        $scope.userProfiles[notification.userId] = profile;
      });
    });
  }, true);

  scrollRef.scroll.observeHasNext(function () {
    $scope.loaded = true;
  });

  $scope.$watch('notifications[0]', function (newVal, oldVal) {
    if (!newVal) return;
    if (oldVal && newVal.$priority < oldVal.$priority) {
      $scope.newNotifications();
    }
  }, true);

  $timeout(function () {
    if ($scope.notifications.length) $scope.loadMore();
  }, 3000);

  $scope.loadMore = function () {
    scrollRef.scroll.next(3);
    $scope.$broadcast('scroll.infiniteScrollComplete');
  };

  $scope.removeNotification = function (id) {
    $scope.notifications.$remove(id);
  };

  $scope.goToNotification = function (notification) {
    $scope.notificationSeen();
    if (notification.payload.type == "message") {
      UserProfile.loadProfile(notification.userId).then(function (user) {
        $state.go("app.conversation", {user: user, userId: notification.userId});
      });
    } else {
      $state.go("app.publication", {publicationId: notification.payload.publicationId}, {});
    }
  };

}]);
