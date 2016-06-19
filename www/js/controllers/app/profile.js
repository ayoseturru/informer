/**
 * Created by Ayose on 23/03/2016.
 */
app.controller('Profile', ['$scope', 'User', 'DatabaseReference', 'Toast', '$ionicPopup', '$timeout', 'Camera', 'Alert', 'DateHelper', '$firebaseArray', function ($scope, User, DatabaseReference, Toast, $ionicPopup, $timeout, Camera, Alert, DateHelper, $firebaseArray) {
  $scope.User = User;
  $scope.publicationsLoaded = false;
  var publicationsScrollReference = new Firebase.util.Scroll(DatabaseReference.getReference("/users/" + User.user.uid + "/publications"), '$priority');
  $scope.publications = $firebaseArray(publicationsScrollReference);

  publicationsScrollReference.scroll.observeHasNext(function () {
    $scope.publicationsLoaded = true;
  });

  publicationsScrollReference.scroll.next(3);

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

  function uploadProfileImage(image) {
    DatabaseReference.getReference("/users/" + User.user.uid + "/profile/profileImage").set(image, function (errors) {
      errors ? Alert.show("Error", errors) : false;
    });
  }

  function updateProfileImage(image) {
    User.user.profileImage = image;
    uploadProfileImage(image);
    User.update();
    Toast.show('Profile image updated', 'short', 'top');
  }

  $scope.showPopup = function () {
    $scope.data = {};

    var myPopup = $ionicPopup.show({
      title: 'Select the way to upload your profile image',
      scope: $scope,
      buttons: [
        {
          text: "<i class='icon ion-android-cancel'></i>",
          type: 'button-stable'
        },
        {
          text: "<i class='icon ion-trash-a'></i>",
          type: 'button-assertive',
          onTap: function (e) {
            updateProfileImage("");
          }
        },
        {
          text: "<i class='icon ion-image'></i>",
          type: 'button-positive',
          onTap: function (e) {
            Camera.chosePicture().then(function (image) {
              updateProfileImage("data:image/jpeg;base64," + image);
            });
          }
        },
        {
          "text": "<i class='icon ion-camera'></i>",
          type: 'button-positive',
          onTap: function (e) {
            Camera.getPicture(undefined, true).then(function (image) {
              updateProfileImage("data:image/jpeg;base64," + image);
            });
          }
        }
      ]
    });

    myPopup.then(function (res) {
    });

    $timeout(function () {
      myPopup.close();
    }, 10000);
  };

  $scope.updateProfile = function () {
    if (User.user.extra) {
      DatabaseReference.getReference("/users/" + User.user.uid + "/profile/extra").set(User.user.extra, function () {
        Toast.show('Profile updated', 'short', 'top');
        User.update();
      });
    }
  };

}]);
