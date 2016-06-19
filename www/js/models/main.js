app.factory("Publication", ['$q', 'DatabaseReference', 'UserProfile', function ($q, DatabaseReference, UserProfile) {
  var Publication = {};

  Publication.publication = {images: []};

  Publication.reset = function () {
    this.publication = {images: []};
  };

  Publication.getOwner = function (publication, user) {
    var q = $q.defer();

    UserProfile.loadProfile(user).then(function (data) {
      q.resolve({
        name: data.name + " " + (data.firstSurname || ""),
        profileImage: data.profileImage
      });
    });

    return q.promise;
  };

  Publication.getPublication = function (publication, user) {
    var q = $q.defer();

    DatabaseReference.getReference("/users/" + user + "/publications/" + publication).once("value", function (snapshot) {
      snapshot.val() ? q.resolve(snapshot.val()) : q.reject();
    });

    return q.promise;
  };

  return Publication;
}]);

app.factory("User", ['DatabaseReference', '$localStorage', function (DatabaseReference, $localStorage) {
  var User = {};

  User.user = {};

  User.clear = function () {
    this.user = {};
  };

  User.isLogged = function () {
    return DatabaseReference.getReference().getAuth() ? true : false;
  };

  User.getAuth = function () {
    DatabaseReference.getReference().getAuth();
  };

  User.update = function () {
    $localStorage.setObject("User", User);
  };

  return User;
}]);

app.factory("Toast", ['$cordovaToast', 'Alert', function ($cordovaToast, Alert) {
  var Toast = {};

  Toast.show = function (message, duration, location) {
    if (ionic.Platform.isAndroid() || ionic.Platform.isIOS()) {
      $cordovaToast.show(message, duration, location).then(function (success) {
      }, function (error) {
      });
    } else {
      Alert.show("Notice", message);
    }
  };

  return Toast;
}]);
