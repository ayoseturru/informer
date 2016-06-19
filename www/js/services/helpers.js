/**
 * Created by Ayose on 07/04/2016.
 */

app.factory("DateHelper", [function () {
  return {
    formatDate: function (date) {
      var formatedDate = "";

      angular.forEach(date.split(" ", 5), function (data) {
        formatedDate += data + " ";
      });

      return formatedDate
    }
  };
}]);
