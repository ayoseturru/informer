app.factory("RootReference", function () {
  return "https://domain.firebaseio.com";
});

app.factory("DatabaseReference", ['RootReference', function (RootReference) {
  var databaseReference = {};

  databaseReference.getReference = function (path) {
    path = path || "";
    return new Firebase(RootReference + path);
  };

  return databaseReference;
}]);

app.factory("DatabaseArray", ['DatabaseReference', '$firebaseArray', function (DatabaseReference, $firebaseArray) {
  var databaseArray = {};

  databaseArray.getArray = function (path) {
    return $firebaseArray(DatabaseReference.getReference(path));
  };

  return databaseArray;
}]);
