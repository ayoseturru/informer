/**
 * Created by Ayose on 23/03/2016.
 */
app.controller('Home', ['$scope', 'DatabaseReference', 'User', '$q', 'Publication', '$ionicLoading', '$ionicModal', 'PublicationsViewer', '$timeout', 'DateHelper', '$firebaseArray', function ($scope, DatabaseReference, User, $q, Publication, $ionicLoading, $ionicModal, PublicationsViewer, $timeout, DateHelper, $firebaseArray) {
  $scope.publications = PublicationsViewer.getPublications();
  var publicationsScrollReference = new Firebase.util.Scroll(DatabaseReference.getReference("/universities/" + User.user.university + "/publications"), '$priority');
  $scope.publicationsLoaded = false;
  $scope.publicationsThread = $firebaseArray(publicationsScrollReference);
  $scope.university = User.user.university;
  $scope.loadingIsNotVisible = false;
  $scope.User = User;
  $scope.news = {};
  $scope.currentTag = PublicationsViewer.getCurrentTag();

  var tagHasChanged = function () {
    $scope.currentTag = PublicationsViewer.getCurrentTag();
  };

  PublicationsViewer.addObserver(tagHasChanged);

  publicationsScrollReference.scroll.observeHasNext(function () {
    $scope.publicationsLoaded = true;
    console.log("loaded");
  });

  $timeout(function () {
    !$scope.publicationsThread.length ? $scope.loadMore() : false;
  }, 4000);

  $scope.$watch('publicationsThread[0]', function (newVal, oldVal) {
    if (oldVal && newVal.$priority < oldVal.$priority && (newVal.user != User.user.uid)) {
      if ($scope.currentTag) {
        newVal.tags[$scope.currentTag] ? $scope.news.university = true : false;
      } else {
        $scope.news.university = true;
      }
    }
  }, true);

  $scope.newsSeen = function () {
    $scope.news.university = false;
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
    PublicationsViewer.loadPublication(id, user, anonymous);
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
    PublicationsViewer.setHashTag("");
    $scope.news.university = false;
    $scope.scrollTop();
  };

  $scope.searchByTag = function (tag) {
    PublicationsViewer.setHashTag(tag);
    $scope.scrollTop();
  };

}]);
