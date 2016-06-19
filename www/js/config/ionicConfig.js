/**
 * Created by Ayose on 22/03/2016.
 */
app.config(['$ionicConfigProvider', function ($ionicConfigProvider) {
  $ionicConfigProvider.tabs.position('bottom');
  $ionicConfigProvider.navBar.alignTitle('center');
  $ionicConfigProvider.form.toggle('large').checkbox('circle');
  // $ionicConfigProvider.scrolling.jsScrolling(true);
}]);

app.config(function ($compileProvider) {
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel|data):/);
});

