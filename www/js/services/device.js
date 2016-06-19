/**
 * Created by Ayose on 18/03/2016.
 */
app.factory("DeviceInfo", function ($window) {
  var device = {
    width: $window.screen.width,
    height: $window.screen.height
  };

  return device;
});

app.factory('$localStorage', ['$window', function ($window) {
  return {
    set: function (key, value) {
      $window.localStorage[key] = value;
    },
    get: function (key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function (key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function (key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
}]);

app.factory('Camera', ['$q', function ($q) {

  return {
    getPicture: function (options, isProfileImage) {
      var q = $q.defer();
      var default_options = {
        quality: 75,
        destinationType: isProfileImage ? Camera.DestinationType.DATA_URL : Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: isProfileImage,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 500,
        targetHeight: 500,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false
      };

      navigator.camera.getPicture(function (result) {
        q.resolve(result);
      }, function (err) {
        q.reject(err);
      }, options || default_options);

      return q.promise;
    },
    chosePicture: function () {
      var q = $q.defer();
      var options = {
        quality: 75,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        allowEdit: true,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 500,
        targetHeight: 500,
        popoverOptions: CameraPopoverOptions,
        saveToPhotoAlbum: false
      };

      navigator.camera.getPicture(function (result) {
        q.resolve(result);
      }, function (err) {
        q.reject(err);
      }, options);
      return q.promise;
    }
  }
}]);

app.factory("ImagePicker", ['$q', '$cordovaImagePicker', function ($q, $cordovaImagePicker) {

  return {
    getPictures: function () {
      var q = $q.defer();
      var options = {
        maximumImagesCount: 15,
        width: 400,
        height: 400,
        quality: 30
      };

      var images = [];
      $cordovaImagePicker.getPictures(options).then(function (results) {
        for (var i = 0; i < results.length; i++) {
          images.push({src: results[i]});
        }
        q.resolve(images);
      }, function (error) {
        q.reject(JSON.stringify(error));    // In case of error
      });
      return q.promise;
    }
  };
}]);
