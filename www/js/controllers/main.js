/**
 * Created by Ayose on 20/02/2016.
 */
app.controller("Main", ['$scope', 'AuthService', 'User', '$ionicScrollDelegate', '$ionicTabsDelegate', '$ionicPopup', 'PublicationManager', '$localStorage', 'DatabaseReference', '$state', '$stateParams', '$firebaseArray', '$ionicPopup', 'Toast', '$ionicModal', 'DateHelper', '$interval', 'PublicationsViewer', 'CareerPublicationsViewer', 'Alert', 'AppPushNotifications', '$q', function ($scope, AuthService, User, $ionicScrollDelegate, $ionicTabsDelegate, $ionicPopup, PublicationManager, $localStorage, DatabaseReference, $state, $stateParams, $firebaseArray, $ionicPopup, Toast, $ionicModal, DateHelper, $interval, PublicationsViewer, CareerPublicationsViewer, Alert, AppPushNotifications, $q) {
  $scope.userSchooling = {university: User.user.university, career: User.user.career};
  $scope.universityWall = true;
  $scope.notificationAdded = false;
  $scope.firstNotification = 0;

  $scope.updateNotificationsAdded = function () {
    $scope.notificationAdded = false;
    $state.go('app.notifications');
  };

  $interval(function () {
    $scope.clearPublicationsCache();
  }, 1200000);

  $scope.$watch('firstNotification[0]', function (newVal, oldVal) {
    if (newVal == undefined) return;
    if (((newVal && oldVal) && true) && (newVal.$priority < oldVal.$priority)) {
      $scope.notificationAdded = true;
    }
  }, true);

  $firebaseArray(DatabaseReference.getReference("/users/" + User.user.uid + "/notifications/").orderByPriority().limitToFirst(1)).$loaded().then(function (data) {
    $scope.firstNotification = data;
  });

  $scope.logout = function () {
    AuthService.logout();
  };

  $scope.changeWall = function (state) {
    $scope.universityWall = (state == "app.home" ? true : false);
  };

  $scope.scrollTop = function () {
    $ionicScrollDelegate.scrollTop();
    ($state.current.name == "app.likes") || ($state.current.name == "app.comments") || ($state.current.name == "app.userProfile") ? $state.go("app.home") : false;
  };

  $scope.notificationSeen = function () {
    $scope.notificationAdded = false;
  };
  // $scope.goForward = function () {
  //   var selected = $ionicTabsDelegate.selectedIndex();
  //   if (selected != -1) {
  //     $ionicTabsDelegate.select(selected + 1);
  //   }
  // };
  //
  // $scope.goBack = function () {
  //   var selected = $ionicTabsDelegate.selectedIndex();
  //   if (selected != -1 && selected != 0) {
  //     $ionicTabsDelegate.select(selected - 1);
  //   }
  // };

  $scope.clearPublicationsCache = function () {
    PublicationsViewer.clearHomePublicationsCache();
    CareerPublicationsViewer.clearCareerHomePublicationsCache();
  };

  $scope.deletePublication = function (publicationId) {

    var myPopup = $ionicPopup.show({
      title: 'Are you sure yo want to delete this publication?',
      subtitle: 'Select where do you want to delete',
      scope: $scope,
      buttons: [
        {
          text: 'Cancel',
          type: 'button-balanced'
        },
        {
          text: '<b>Delete</b>',
          type: 'button-assertive',
          onTap: function (e) {
            PublicationManager.delete(publicationId);
          }
        }
      ]
    });
  };

  function updateLike(publicationId, userId, like) {
    DatabaseReference.getReference("/users/" + User.user.uid + "/profile/likes/" + publicationId).set(like || {});
    DatabaseReference.getReference("/users/" + userId + "/publications/" + publicationId + "/likes/" + User.user.uid).set(like || {}, function (error) {
      error ? Alert.show("Error", error) : ((userId != User.user.uid) && like) ? AppPushNotifications.sendLikeNotification(userId, publicationId) : false;
    });
  }

  $scope.like = function (publicationId, userId, like) {
    User.user.likes[publicationId] = like;
    User.update();
    updateLike(publicationId, userId, like);
  };

  $scope.goToLikes = function (publicationId, userId, state) {
    $firebaseArray(DatabaseReference.getReference("/users/" + userId + "/publications/" + publicationId + "/likes")).$loaded().then(function (data) {
      $state.go(state ? state : "app.likes", {likes: data})
    });
  };

  $scope.goToComments = function (publicationId, userId, state) {
    $firebaseArray(DatabaseReference.getReference("/users/" + userId + "/publications/" + publicationId + "/comments")).$loaded().then(function (data) {
      $state.go(state ? state : "app.comments", {
        comments: data,
        owner: userId,
        publicationId: publicationId
      })
    });
  };

  $scope.sendComment = function (publicationId, userId) {
    $scope.newComment = {comment: ""};
    var myPopup = $ionicPopup.show({
      template: '<textarea rows="4" cols="70" ng-model="newComment.comment">',
      title: 'Enter the comment',
      cssClass: 'new_message_popup',
      scope: $scope,
      buttons: [
        {text: "<i class='ion-android-cancel'></i>", type: "button-assertive"},
        {
          text: "<i class='ion-paper-airplane'></i>",
          type: 'button-balanced',
          onTap: function (e) {
            if (!$scope.newComment.comment) {
              e.preventDefault();
            } else {
              DatabaseReference.getReference("/users/" + userId + "/publications/" + publicationId + "/comments").push(
                {
                  comment: $scope.newComment.comment,
                  date: new Date() + "",
                  user: User.user.uid
                }, function (error) {
                  error ? Alert.show("Error", error) : userId != User.user.uid ? AppPushNotifications.sendCommentNotification(userId, publicationId) : false;
                }
              );
              Toast.show('Sending comment', 'short', 'top');
            }
          }
        }
      ]
    });
  };

  $scope.formatDate = function (date) {
    return DateHelper.formatDate(date);
  };

  $scope.showModal = function (templateUrl, images, index) {
    $scope.currentPublicationImages = images;
    $scope.activeSlide = index;
    $ionicModal.fromTemplateUrl(templateUrl, {
      scope: $scope,
      animation: 'slide-in-up'
    }).then(function (modal) {
      $scope.modal = modal;
      $scope.modal.show();
    });
  };

  $scope.closeModal = function () {
    $scope.modal.hide();
    $scope.modal.remove()
  };

  $scope.backToRoot = function (state) {
    if ($state.current.name != state)$state.go(state, {}, {reload: true});
  };

  $scope.newNotifications = function () {
    $scope.notificationAdded = true;
  };

}]);
