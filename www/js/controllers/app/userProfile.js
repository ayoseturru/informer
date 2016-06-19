/**
 * Created by Ayose on 06/04/2016.
 */
app.controller("UserProfile", ['$scope', '$stateParams', '$q', 'DatabaseReference', '$firebaseArray', 'DateHelper', '$ionicModal', '$ionicPopup', 'Chat', 'Toast', 'User', 'UserProfile', '$state', 'AppPushNotifications', function ($scope, $stateParams, $q, DatabaseReference, $firebaseArray, DateHelper, $ionicModal, $ionicPopup, Chat, Toast, User, UserProfile, $state, AppPushNotifications) {
  $scope.currentUser = $stateParams.user;
  !$stateParams.user ? $state.go("app.home", {}, {reload: true}) : false;
  $scope.publicationsLoaded = false;
  $scope.User = User;
  var publicationsScrollReference = new Firebase.util.Scroll(DatabaseReference.getReference("/users/" + $scope.currentUser + "/publications"), '$priority');
  $scope.publications = $firebaseArray(publicationsScrollReference);

  publicationsScrollReference.scroll.observeHasNext(function () {
    $scope.publicationsLoaded = true;
  });

  publicationsScrollReference.scroll.next(3);

  UserProfile.loadProfile($stateParams.user).then(function (userProfile) {
    $scope.requestedUser = userProfile;
  });

  $scope.loadMore = function () {
    publicationsScrollReference.scroll.next(3);
    $scope.$broadcast('scroll.infiniteScrollComplete');
  };

  $scope.formatDate = function (date) {
    return DateHelper.formatDate(date || (new Date() + ""));
  };

  $scope.showImages = function (key, imageIndex) {
    $scope.showModal('templates/image-popover.html', $scope.publications.$getRecord(key).images, imageIndex);
  };

  $scope.sendMessage = function () {
    $scope.newMessage = {};
    var myPopup = $ionicPopup.show({
      template: '<textarea rows="4" cols="70" ng-model="newMessage.content">',
      title: 'Enter the message',
      cssClass: 'new_message_popup',
      scope: $scope,
      buttons: [
        {text: "<i class='ion-android-cancel'></i>", type: "button-assertive"},
        {
          text: "<i class='ion-paper-airplane'></i>",
          type: 'button-balanced',
          onTap: function (e) {
            if (!$scope.newMessage.content) {
              e.preventDefault();
            } else {
              Chat.sendMessage($scope.newMessage.content, $scope.currentUser);
              Toast.show('Sending message', 'short', 'top');
              AppPushNotifications.sendMessageNotification(User.user.uid, $scope.currentUser, $scope.newMessage.content);
            }
          }
        }
      ]
    });
  };

}]);
