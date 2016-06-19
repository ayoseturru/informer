/**
 * Created by Ayose on 10/04/2016.
 */
app.filter('toInAppBrowser', function ($sce, $sanitize) {
  return function (text) {
    var regex = /href="([\S]+)"/g;
    var newString = $sanitize(text).replace(regex, "onClick=\"window.open('$1', '_blank', 'location=no')\"");
    return $sce.trustAsHtml(newString);
  }
});
