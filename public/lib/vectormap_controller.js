var _ = require('lodash');

var module = require('ui/modules').get('vectormap');

module.controller('VectormapController', function ($scope) {
  $scope.$watch('esResponse', function (resp) {
    if (!resp) {
      $scope.data = null;
      return;
    }

    var geoCodeAggId = _.first(_.pluck($scope.vis.aggs.bySchemaName['segment'], 'id'));
    var metricsAgg = _.first($scope.vis.aggs.bySchemaName['metric']);

    var buckets = resp.aggregations[geoCodeAggId].buckets;

    $scope.data = {};

    buckets.forEach(function (bucket) {
      $scope.data[bucket.key.toUpperCase()] = metricsAgg.getValue(bucket);
    });
  });
});
