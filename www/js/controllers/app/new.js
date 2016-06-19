/**
 * Created by Ayose on 22/03/2016.
 */
app.controller('New', ['$scope', 'AuthService', 'User', 'DatabaseArray', 'DeviceInfo', '$localStorage', 'Publication', 'ImagePicker', 'Camera', 'Confirm', 'Alert', 'PublicationManager', 'Toast',
  function ($scope, AuthService, User, DatabaseArray, DeviceInfo, $localStorage, Publication, ImagePicker, Camera, Confirm, Alert, PublicationManager, Toast) {
    $scope.Publication = Publication;
    $scope.device = DeviceInfo;
    $scope.tags = DatabaseArray.getArray("/tags");
    $scope.User = User;

    $scope.imagePicker = function () {
      ImagePicker.getPictures().then(function (images) {
        Publication.publication.images.push.apply(Publication.publication.images, images);
      });
    };

    $scope.deleteImage = function (id) {
      Publication.publication.images.splice(id, 1);
    };

    $scope.setTag = function (tag) {
      Publication.publication.searchTag = Publication.publication.searchTag.indexOf("#") > -1 ? Publication.publication.searchTag.substring(Publication.publication.searchTag.indexOf("#"), Publication.publication.searchTag.length - Publication.publication.tagFilter.length) + ("#" + tag + " ") : "#" + tag + " ";
      Publication.publication.tagFilter = "";
    };

    $scope.updateTagFilter = function () {
      if (Publication.publication.searchTag.indexOf("#") < 0) {
        Publication.publication.tagFilter = Publication.publication.searchTag;
      } else {
        Publication.publication.tagFilter = Publication.publication.searchTag.substring(Publication.publication.searchTag.lastIndexOf(" ") + 1);
      }
    };

    $scope.takePic = function () {
      Camera.getPicture().then(function (imageURI) {
        $scope.Publication.publication.images.push({src: imageURI});
      }, function (err) {
        Alert.show(err);
      });
    };

    function publicationParams() {
      return Publication.publication.title && Publication.publication.content && (Publication.publication.university || Publication.publication.career);
    }

    function showInvalidPublicationAlert() {
      Alert.show("Error", "Make you sure you have write a title, a descriptions and a wall to share your" +
        " publication...");
    }

    $scope.newPublication = function () {
      if (publicationParams()) {
        Confirm.showConfirm().then(function (res) {
          PublicationManager.upload(Publication.publication.title, Publication.publication.content, Publication.publication.searchTag || "#false", Publication.publication.images, Publication.publication.university || false, Publication.publication.career || false, Publication.publication.anonymous || false);
          Toast.show('Uploading publication', 'short', 'top');
          Publication.reset();
        });
      } else {
        showInvalidPublicationAlert();
      }
    };
  }]);
