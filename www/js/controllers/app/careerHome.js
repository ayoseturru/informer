/**
 * Created by Ayose on 23/03/2016.
 */
app.controller('CareerHome', ['$scope', 'DatabaseReference', 'User', '$q', 'Publication', '$ionicLoading', '$ionicModal', 'CareerPublicationsViewer', '$timeout', 'DateHelper', '$firebaseArray', function ($scope, DatabaseReference, User, $q, Publication, $ionicLoading, $ionicModal, CareerPublicationsViewer, $timeout, DateHelper, $firebaseArray) {
  $scope.publications = CareerPublicationsViewer.getPublications();
  var publicationsScrollReference = new Firebase.util.Scroll(DatabaseReference.getReference("/universities/" + User.user.university + "/careers/" + User.user.career + "/publications"), '$priority');
  $scope.publicationsLoaded = false;
  $scope.publicationsThread = $firebaseArray(publicationsScrollReference);
  $scope.university = User.user.university;
  $scope.loadingIsNotVisible = false;
  $scope.User = User;
  $scope.news = {};
  $scope.currentTag = CareerPublicationsViewer.getCurrentTag();

  var tagHasChanged = function () {
    $scope.currentTag = CareerPublicationsViewer.getCurrentTag();
  };

  CareerPublicationsViewer.addObserver(tagHasChanged);

  publicationsScrollReference.scroll.observeHasNext(function () {
    $scope.publicationsLoaded = true;
  });

  $scope.$watch('publicationsThread[0]', function (newVal, oldVal) {
    if (oldVal && newVal.$priority < oldVal.$priority && (newVal.user != User.user.uid)) {
      if ($scope.currentTag) {
        newVal.tags[$scope.currentTag] ? $scope.news.career = true : false;
      } else {
        $scope.news.career = true;
      }
    }
  }, true);

  $scope.newsSeen = function () {
    $scope.news.career = false;
    $scope.scrollTop();
  };

  publicationsScrollReference.scroll.next(5);

  $ionicLoading.show({
    template: "<ion-spinner icon='spiral' class='spinner-positive'>Loading</ion-spinner>"
  });

  /*
   When the view has eben cached, loadPublication() is not called, so it's necessary a workaround.
   3000ms is time enough to normal load. So If the page is not cached, data is being requested and
   the loading will be hidden by loadPublication().
   */
  $timeout(function () {
    $ionicLoading.hide();
    $scope.loadingIsNotVisible = true;
  }, 3000);

  $scope.loadPublication = function (id, user, anonymous) {
    CareerPublicationsViewer.loadPublication(id, user, anonymous);
    $ionicLoading.hide();
    $scope.loadingIsNotVisible = true;
  };

  $scope.loadMore = function () {
    publicationsScrollReference.scroll.next(10);
    $scope.$broadcast('scroll.infiniteScrollComplete');
  };

  $scope.showImages = function (index, publication) {
    $scope.showModal('templates/image-popover.html', $scope.publications[publication].publication.images, index);
  };

  $scope.disableTag = function () {
    CareerPublicationsViewer.setHashTag("");
    $scope.news.career = false;
    $scope.scrollTop();
  };

  $scope.searchByTag = function (tag) {
    CareerPublicationsViewer.setHashTag(tag);
    $scope.scrollTop();
  };

}]);
