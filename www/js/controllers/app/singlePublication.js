/**
 * Created by ayoseturru on 22/04/2016.
 */
app.controller("SinglePublication", ['$scope', 'DatabaseReference', '$state', '$stateParams', 'User', '$q', '$ionicLoading', function ($scope, DatabaseReference, $state, $stateParams, User, $q, $ionicLoading) {
  var publicationId = $stateParams.publicationId;
  !publicationId ? $state.go("app.notifications", {}, {reload: true}) : false;
  $scope.publication = "";
  $scope.User = User;
  $scope.showDeleted = false;
  $scope.loaded = false;

  $ionicLoading.show({
    template: 'Loading...'
  });

  function loadPublication() {
    var q = $q.defer();

    DatabaseReference.getReference("/users/" + User.user.uid + "/publications/" + publicationId).once("value", function (snapshot) {
      snapshot.val() ? q.resolve(snapshot.val()) : q.reject();
    });

    return q.promise;
  }

  loadPublication().then(function (publication) {
    $scope.publication = publication;
    $scope.publication.$id = publicationId;
    $scope.loaded = true;
    $ionicLoading.hide();
  }, function () {
    $scope.showDeleted = true;
    $ionicLoading.hide();
  });


  $scope.showImages = function (key, imageIndex) {
    $scope.showModal('templates/image-popover.html', $scope.publication.images, imageIndex);
  };

  $scope.backToNotifications = function () {
    $state.go('app.notifications', {}, {reload: true});
  };

}]);
