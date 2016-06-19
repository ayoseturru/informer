/**
 * Created by Ayose on 11/02/2016.
 */
app.controller("Access", ['$scope', 'AuthService', 'Alert', '$stateParams', '$state', '$ionicSlideBoxDelegate', 'User', 'DatabaseReference', 'DatabaseArray', 'DeviceInfo', '$ionicLoading',
  function ($scope, AuthService, Alert, $stateParams, $state, $ionicSlideBoxDelegate, User, DatabaseReference, DatabaseArray, DeviceInfo, $ionicLoading) {
    User.clear();
    $scope.User = User;
    $scope.device = DeviceInfo;
    $scope.slide = {show: $stateParams.slide, stateParam: $stateParams.slide};
    $scope.errors = [];


    function showLoginLoading() {
      $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
      });
    }

    function hideLoginLoading() {
      $ionicLoading.hide();
    }

    $scope.changeAccessView = function (state) {
      $state.go(state);
    };

    $scope.setUniversities = function () {
      $scope.universities = DatabaseArray.getArray("/universitiesForAccess");
    };

    $scope.login = function (currentUser) {
      showLoginLoading();

      AuthService.loginWithPassword(User.user.email, User.user.password, currentUser || false).then(function () {
        hideLoginLoading();
      });
    };

    $scope.lockSlide = function () {
      $ionicSlideBoxDelegate.enableSlide(false);
    };

    $scope.next = function () {
      $ionicSlideBoxDelegate.next();
    };

    $scope.previous = function () {
      $ionicSlideBoxDelegate.previous();
    };

    $scope.setUniversity = function (universityCode, universityName) {
      User.user.university = universityCode + ": " + universityName;
      User.user.career = "";
      setCareers();
    };

    function createArrayForFilter() {
      $scope.careersFilter = [];
      $scope.careers.$loaded()
        .then(function () {
          angular.forEach($scope.careers, function (career) {
            $scope.careersFilter.push(career.$id);
          })
        });
    }

    function setCareers() {
      if (checkUniversity()) {
        $scope.careers = DatabaseArray.getArray("/universitiesForAccess/" + $scope.User.user.university.split(":")[0] + "/careers");
        createArrayForFilter();
      }
    }

    function checkUniversity() {
      return User.user.university && User.user.university.indexOf(":") > -1 && $scope.universities.$getRecord(User.user.university.split(":")[0]);
    }

    $scope.setCareer = function (career) {
      User.user.career = career + "  ";
    };

    function checkCareer() {
      return $scope.universities.$getRecord(User.user.university.split(":")[0]).careers[User.user.career.trim()] ? true : false;
    }

    function getNewUser() {
      return {
        email: User.user.email,
        name: User.user.name,
        firstSurname: User.user.firstSurname || "",
        secondSurname: User.user.secondSurname || "",
        university: User.user.university.split(":")[0],
        career: User.user.career.trim(),
        completeName: ((User.user.name) + " " + (User.user.firstSurname || "") + " " + (User.user.secondSurname || "")).toLocaleLowerCase().trim().latinize()
      };
    }

    function addUserToInformerSystem(newUser, uid) {
      DatabaseReference.getReference("/universities/" + newUser.university + "/careers/" + newUser.career + "/users/" + uid).set({
        "user": uid,
        "completeName": newUser.completeName
      });
      DatabaseReference.getReference("/universities/" + newUser.university + "/users/" + uid).set({
        "user": uid,
        "completeName": newUser.completeName
      });
      DatabaseReference.getReference("/users/" + uid + "/completeName").set((newUser.name + " " + newUser.firstSurname + " " + newUser.secondSurname).toLowerCase().trim().latinize());
      DatabaseReference.getReference("/users/" + uid + "/profile").set(newUser);
    }

    function createFirebaseUserAccount(newUser) {
      DatabaseReference.getReference().createUser({
        email: User.user.email,
        password: User.user.password
      }, function (error, userData) {
        if (error) {
          Alert.show("Error", error);
        } else {
          addUserToInformerSystem(newUser, userData.uid);
          $scope.login(newUser);
        }
      });
    }

    function createUser() {
      var newUser = getNewUser();
      createFirebaseUserAccount(newUser);
      $stateParams.slide = 0;
    }

    $scope.createAccount = function () {
      (checkUniversity() && checkCareer()) ? createUser() : $scope.User.user.schoolingErrors = true;
    };

    $scope.checkEmailExists = function () {
      $scope.emailNotChecked = true;
      DatabaseReference.getReference().authWithPassword({
        email: User.user.email,
        password: "_"
      }, function (error, authData) {
        if (error) {
          $scope.errors = ((error.code == "INVALID_USER") ? {emailTaken: false} : {emailTaken: true});
          $scope.emailNotChecked = false;
        }
      });
    };

    $scope.facebookLogin = function () {
      showLoginLoading();
      DatabaseReference.getReference().authWithOAuthPopup("facebook", function (error, authData) {
        if (error) {
          Alert.show("Error", error);
        } else {
          User.user.email = authData.facebook.email || authData.facebook.id; // Sometimes facebook doesn't return email, in this case the firebase key is the facebook id.
          facebookLoginRedirect(authData);
        }
        hideLoginLoading();
      }, {
        remember: "default",
        scope: "email"
      });
    };

    function createFacebookUser() {
      var newUser = {
        email: $stateParams.facebookUser.facebook.email || $stateParams.facebookUser.facebook.id,
        name: $stateParams.facebookUser.facebook.displayName,
        career: User.user.career.trim(),
        university: User.user.university.split(":")[0],
        firstSurname: "",
        secondSurname: "",
        completeName: $stateParams.facebookUser.facebook.displayName.toLowerCase().trim().latinize(),
        uid: $stateParams.facebookUser.uid
      };
      addUserToInformerSystem(newUser, $stateParams.facebookUser.uid);
      AuthService.loginWithFacebook(newUser, true);
      $stateParams.slide = 0;
    }

    $scope.createFacebookUserAccount = function () {
      (checkUniversity() && checkCareer()) ? createFacebookUser() : $scope.User.user.schoolingErrors = true;
    };

    function facebookLoginRedirect(facebookUser) {
      DatabaseReference.getReference("/users/" + facebookUser.uid + "/profile").once("value", function (snapshot) {
        snapshot.exists() ? AuthService.loginWithFacebook({uid: facebookUser.uid}, false) : $state.go("signUp", {
          slide: 2,
          facebookUser: facebookUser
        });
      });
    }

  }

]);

