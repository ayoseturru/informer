/**
 * Created by Ayose on 18/03/2016.
 */
app.factory("Alert", ['$ionicPopup', function ($ionicPopup) {
  var alert = {};

  alert.show = function (title, message) {
    $ionicPopup.alert({
      title: title || "Error",
      template: message || "An error ocurred"
    });
  };

  return alert;

}]);

app.factory("Confirm", ['$ionicPopup', '$q', function ($ionicPopup, $q) {

  return {
    showConfirm: function (options) {
      var q = $q.defer();

      var defaultOptions = {
        title: 'Confirmation',
        template: 'Are you sure?'
      };

      var confirmPopup = $ionicPopup.confirm(defaultOptions || options);

      confirmPopup.then(function (res) {
        if (res) {
          q.resolve(res);
        } else {
          q.reject(res);
        }
      });

      return q.promise;
    }
  }
}]);

app.factory("AuthService", ['DatabaseReference', '$state', 'User', 'Alert', '$localStorage', '$ionicHistory', '$q', 'AppPushNotifications', '$window', function (DatabaseReference, $state, User, Alert, $localStorage, $ionicHistory, $q, AppPushNotifications, $window) {
  var authService = {};

  function clearHistory() {
    $ionicHistory.clearCache().then(function () {
      $ionicHistory.clearHistory();
      $ionicHistory.nextViewOptions({disableBack: true, historyRoot: true});
    });
  }

  authService.logout = function () {
    DatabaseReference.getReference("/users/" + User.user.uid + "/devices").set({}, function (error) {
      DatabaseReference.getReference().unauth();
    });
    User.clear();
    $localStorage.setObject("User", false);
    $localStorage.setObject("homePublications", {});
    $localStorage.setObject("careerPublications", {});
    clearHistory();
    ionic.Platform.exitApp();
    if (!ionic.Platform.isAndroid() && !ionic.Platform.isIOS()) $window.location.href = '/';
  };

  function redirectUserToMainViewRequestingCurrentUserData(uid) {
    DatabaseReference.getReference("/users/" + uid + "/profile").once("value", function (snapshot) {
      var user = snapshot.val();
      user["uid"] = uid;
      redirectUserToMainView(user);
    }, function (error) {
      Alert.show("Error", error);
    });
  }

  authService.loginWithPassword = function (email, password, newUser) {
    var q = $q.defer();

    DatabaseReference.getReference().authWithPassword({
      email: email,
      password: password
    }, function (error, authData) {
      error ? Alert.show("Error", error) : (newUser ? (newUser.uid = authData.uid) && (redirectUserToMainView(newUser)) : redirectUserToMainViewRequestingCurrentUserData(authData.uid));
      q.resolve();
    });

    return q.promise;
  };

  authService.loginWithFacebook = function (user, isNewUser) {
    isNewUser ? redirectUserToMainView(user) : redirectUserToMainViewRequestingCurrentUserData(user.uid);
  };

  function deletePasswordFields() {
    delete User.user.password;
    delete User.user.passwordConfirmation;
  }

  function setCurrentUser(newUser) {
    deletePasswordFields();
    User.user = newUser;
    User.user.name = newUser.name + " " + (newUser.firstSurname || "") + " " + (newUser.secondSurname || "");
    User.user.logged = true;
    User.user.likes = newUser.likes || {};
    $localStorage.setObject("User", User);
  }

  function redirectUserToMainView(newUser) {
    setCurrentUser(newUser);
    AppPushNotifications.prepare();
    AppPushNotifications.registUserDeviceToken(newUser.uid);
    $state.go("app.home");
  }

  return authService;
}]);

app.factory("AppPushNotifications", ['DatabaseReference', '$ionicPush', '$http', '$q', 'UserProfile', 'User', '$state', function (DatabaseReference, $ionicPush, $http, $q, UserProfile, User, $state) {
  var AppPushNotifications = {};
  var profile = 'push';
  var jwt = 'jwt';

  function openConversation(userId) {
    UserProfile.loadProfile(userId).then(function (user) {
      $state.go("app.conversation", {user: user, userId: userId});
    });
  }

  AppPushNotifications.prepare = function () {
    $ionicPush.init({
      "onNotification": function (notification) {
        switch (notification.payload.type) {
          case "message":
            openConversation(notification.payload.userId);
            break;
          case "comment":
            $state.go("app.publication", {publicationId: notification.payload.publicationId}, {});
            break;
          case "like":
            $state.go("app.publication", {publicationId: notification.payload.publicationId}, {});
            break;
        }
      },
      "onRegister": function (data) {
        console.log(data.token);
      },
      "pluginConfig": {
        "ios": {
          "badge": true,
          "sound": true
        },
        "android": {
          "iconColor": "blue",
          "vibrate": "true",
          "forceShow": "true"
        }
      }
    });
  };

  AppPushNotifications.registUserDeviceToken = function (userUid) {
    if (ionic.Platform.isAndroid() || ionic.Platform.isIOS()) {
      $ionicPush.register(function (token) {
        DatabaseReference.getReference("/users/" + userUid + "/devices").set({"token": token.token});
        $ionicPush.saveToken(token, {'ignore_user': true});
      });
    }
  };

  function getUserDeviceToken(userIdRecipient) {
    var q = $q.defer();

    DatabaseReference.getReference("/users/" + userIdRecipient + "/devices").once("value", function (snapshot) {
      snapshot.val() ? q.resolve(snapshot.val().token) : q.resolve("");
    });

    return q.promise;
  }

  AppPushNotifications.sendMessageNotification = function (userIdSender, userIdRecipient, message) {
    sendNotificationToDevice(userIdRecipient, "New message", "From " + User.user.name, {
      "type": "message",
      "userId": User.user.uid
    });
  };

  AppPushNotifications.sendCommentNotification = function (userId, publicationId) {
    sendNotificationToDevice(userId, "New comment", "From " + User.user.name, {
      "type": "comment",
      "userId": userId,
      "publicationId": publicationId
    });
  };

  AppPushNotifications.sendLikeNotification = function (userId, publicationId) {
    sendNotificationToDevice(userId, "New like", "From " + User.user.name, {
      "type": "like",
      "userId": userId,
      "publicationId": publicationId
    });
  };

  function sendNotificationToDevice(userIdRecipient, title, message, payload) {
    getUserDeviceToken(userIdRecipient).then(function (token) {
      var tokens = [token];

      var req = {
        method: 'POST',
        url: 'https://api.ionic.io/push/notifications',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + jwt
        },
        data: {
          "tokens": tokens,
          "profile": profile,
          "notification": {
            "title": title,
            "message": message,
            "android": {
              "image": "https://pbs.twimg.com/profile_images/617058765167329280/9BkeDJlV.png",
              "payload": payload
            },
            "ios": {
              "image": "https://pbs.twimg.com/profile_images/617058765167329280/9BkeDJlV.png",
              "payload": payload
            }
          }
        }
      };

      function saveNotification(userIdRecipient, title, message, payload) {
        var ref = DatabaseReference.getReference("/users/" + userIdRecipient + "/notifications/").push();
        ref.setWithPriority({
          "title": title,
          "message": message,
          "payload": payload,
          "userId": User.user.uid,
          "date": new Date() + ""
        }, 0 - new Date())
      }

      $http(req).success(function (resp) {
        saveNotification(userIdRecipient, title, message, payload);
        console.log("Ionic Push: Push success", resp);
      }).error(function (error) {
        console.log("Ionic Push: Push error", error);
      });
    });
  }

  return AppPushNotifications;
}]);

app.factory("PublicationManager", ['DatabaseReference', 'DatabaseArray', 'User', 'Alert', '$q', function (DatabaseReference, DatabaseArray, User, Alert, $q) {
  var PublicationManager = {};
  var userRef = DatabaseReference.getReference("/users/" + User.user.uid);

  function uploadPublication(title, content, tags, anonymous, university, career, images) {
    var q = $q.defer();
    var ref = userRef.child("publications").push();

    ref.setWithPriority({
      title: title,
      content: content,
      tags: getTagsArray(tags),
      date: new Date() + "",
      anonymous: anonymous,
      university: university,
      career: career,
      images: images || {}
    }, 0 - Date.now(), function (errors) {
      errors ? Alert.show("Error", errors) : q.resolve(ref);
    });

    return q.promise;
  }

  function convertImages(images) {
    var q = $q.defer();
    var promises = [];
    var imagesConverted = [];

    images.forEach(function (image) {
      promises.push(convertImage(image).then(function (image) {
        imagesConverted.push(image);
      }));
    });

    $q.all(promises).then(function () {
      q.resolve(imagesConverted);
    });

    return q.promise;
  }

  function convertImage(image) {
    var q = $q.defer();
    window.plugins.Base64.encodeFile(image.src, function (base64) {
      q.resolve(base64);
    });
    return q.promise;
  }

  function getTagsArray(tags) {
    var tagsArray = {};

    tags.replace(/\s/g, "").replace("#", "").split("#").forEach(function (tag) {
      tagsArray[tag] = true;
    });

    return tagsArray;
  }

  function addPublicationKey(publicationRef, tags, career, images, anonymous) {
    var keyRef = DatabaseReference.getReference("/universities/" + User.user.university + (career ? "/careers/" + User.user.career : "") + "/publications/").push();
    keyRef.setWithPriority({
      user: User.user.uid,
      publication: publicationRef.key(),
      tags: getTagsArray(tags),
      images: images.length > 0 ? images.length : false,
      anonymous: anonymous
    }, 0 - Date.now(), function (errors) {
      errors ? Alert.show("Error", errors) : false;
    });
  }

  PublicationManager.upload = function (title, content, tags, images, university, career, anonymous) {
    convertImages(images).then(function (imagesConverted) {
      uploadPublication(title, content, tags, anonymous, university, career, imagesConverted).then(function (publicationRef) {
        career ? addPublicationKey(publicationRef, tags, true, images, anonymous) : false;
        university ? addPublicationKey(publicationRef, tags, false, images, anonymous) : false;
      });
    });
  };

  function deletePublicationFromCareer(publicationId) {
    DatabaseReference.getReference("/universities/" + User.user.university + "/careers/" + User.user.career + "/publications").orderByChild("publication").equalTo(publicationId).once("value", function (snapshot) {
      snapshot.forEach(function (child) {
        if (child.val().user == User.user.uid) {
          child.ref().remove();
          return;
        }
      });
    });
  }

  function deletePublicationFromUniversity(publicationId) {
    DatabaseReference.getReference("/universities/" + User.user.university + "/publications").orderByChild("publication").equalTo(publicationId).once("value", function (snapshot) {
      snapshot.forEach(function (child) {
        if (child.val().user == User.user.uid) {
          child.ref().remove();
          return;
        }
      });
    });
  }

  function deletePublicationFromUser(publicationId) {
    DatabaseReference.getReference("/users/" + User.user.uid + "/publications/" + publicationId).remove();
  }

  PublicationManager.delete = function (publicationId) {
    deletePublicationFromUser(publicationId);
    deletePublicationFromUniversity(publicationId);
    deletePublicationFromCareer(publicationId);
  };

  return PublicationManager;

}]);

app.factory("PublicationsViewer", ['DatabaseReference', 'DatabaseArray', 'User', '$firebaseArray', 'Publication', '$localStorage', function (DatabaseReference, DatabaseArray, User, $firebaseArray, Publication, $localStorage) {
  var PublicationsViewer = {};
  var publications = $localStorage.getObject("homePublications");
  var observerCallbacks = [];
  var currentTag = "";
  var cachePublications = 0;
  var maxCacheLength = 20;

  PublicationsViewer.getCurrentTag = function () {
    return currentTag;
  };

  function extractImages(images) {
    var extractedImages = [];

    for (var key in images) {
      extractedImages.push({src: images[key]});
    }
    return extractedImages;
  }

  PublicationsViewer.loadPublication = function (id, user, anonymous) {
    if (publications[id]) {
      return;
    } else {
      publications[id] = {images: []};
    }

    if (!anonymous) {
      if (user != User.user.uid) {
        Publication.getOwner(id, user).then(function (result) {
          publications[id].user = result;
          addPublicationToCache(id);
        });
      } else {
        publications[id].user = {name: User.user.name, profileImage: User.user.profileImage};
      }
    }

    Publication.getPublication(id, user).then(function (result) {
      publications[id].publication = result;
      publications[id].publication.images = extractImages(publications[id].publication.images);
      publications[id].publication.ready = true;
      if (cachePublications < maxCacheLength) {
        addPublicationToCache(id);
        cachePublications++;
      }
    });

    function addPublicationToCache(id) {
      var aux = $localStorage.getObject("homePublications");
      aux[id] = publications[id];
      $localStorage.setObject("homePublications", aux);
    }

  };

  PublicationsViewer.getPublications = function () {
    return publications;
  };

  function notifyObservers() {
    angular.forEach(observerCallbacks, function (callback) {
      callback();
    });
  }

  PublicationsViewer.setHashTag = function (tag) {
    currentTag = tag;
    notifyObservers();
  };

  PublicationsViewer.addObserver = function (callback) {
    observerCallbacks.push(callback);
  };

  PublicationsViewer.clearHomePublicationsCache = function () {
    $localStorage.setObject("homePublications", {});
  };

  return PublicationsViewer;
}]);

// Same as before factory, but it's necessary to keep data, controller and view cached.
app.factory("CareerPublicationsViewer", ['DatabaseReference', 'DatabaseArray', 'User', '$firebaseArray', 'Publication', '$localStorage', function (DatabaseReference, DatabaseArray, User, $firebaseArray, Publication, $localStorage) {
  var CareerPublicationsViewer = {};
  var publications = $localStorage.getObject("careerPublications");
  var observerCallbacks = [];
  var currentTag = "";
  var cachePublications = 0;
  var maxCacheLength = 20;

  CareerPublicationsViewer.getCurrentTag = function () {
    return currentTag;
  };

  function extractImages(images) {
    var extractedImages = [];

    for (var key in images) {
      extractedImages.push({src: images[key]});
    }
    return extractedImages;
  }

  CareerPublicationsViewer.loadPublication = function (id, user, anonymous) {
    if (publications[id]) {
      return;
    } else {
      publications[id] = {images: []};
    }

    if (!anonymous) {
      if (user != User.user.uid) {
        Publication.getOwner(id, user).then(function (result) {
          publications[id].user = result;
          addPublicationToCache(id);
        });
      } else {
        publications[id].user = {name: User.user.name, profileImage: User.user.profileImage};
      }
    }

    function addPublicationToCache(id) {
      var aux = $localStorage.getObject("careerPublications");
      aux[id] = publications[id];
      $localStorage.setObject("careerPublications", aux);
    }

    Publication.getPublication(id, user).then(function (result) {
      publications[id].publication = result;
      publications[id].publication.images = extractImages(publications[id].publication.images);
      publications[id].publication.ready = true;
      if (cachePublications < maxCacheLength) {
        addPublicationToCache(id);
        cachePublications++;
      }
    });

  };

  CareerPublicationsViewer.getPublications = function () {
    return publications;
  };

  function notifyObservers() {
    angular.forEach(observerCallbacks, function (callback) {
      callback();
    });
  }

  CareerPublicationsViewer.setHashTag = function (tag) {
    currentTag = tag;
    notifyObservers();
  };

  CareerPublicationsViewer.addObserver = function (callback) {
    observerCallbacks.push(callback);
  };

  CareerPublicationsViewer.clearCareerHomePublicationsCache = function () {
    $localStorage.setObject("careerPublications", {});
  };

  return CareerPublicationsViewer;
}]);

app.factory("Chat", ['DatabaseReference', 'User', 'Alert', function (DatabaseReference, User, Alert) {
  var Chat = {};

  function addMessageToUserConversations(message, userId, destinationUserId, isSender) {
    DatabaseReference.getReference("/users/" + userId + "/conversations/" + destinationUserId).push({
      message: message,
      date: new Date() + "",
      messageIsMine: isSender
    }, function (errors) {
      errors ? Alert.show("Error", errors) : false;
    });
  }

  Chat.sendMessage = function (message, userId) {
    addMessageToUserConversations(message, User.user.uid, userId, true);
    addMessageToUserConversations(message, userId, User.user.uid, false);
  };

  return Chat;

}]);

app.factory("UserProfile", ['DatabaseReference', '$q', 'User', function (DatabaseReference, $q, User) {
  var profiles = {};
  profiles[User.user.uid] = {
    name: User.user.name,
    career: User.user.career,
    university: User.user.university,
    profileImage: User.user.profileImage,
    extra: User.user.extra
  };

  return {
    loadProfile: function (userId) {
      var q = $q.defer();

      if (profiles[userId]) {
        q.resolve(profiles[userId]);
      } else {
        DatabaseReference.getReference("/users/" + userId + "/profile").once("value", function (snapshot) {
          q.resolve(snapshot.val());
        });
      }
      return q.promise;
    }
  };

}]);
