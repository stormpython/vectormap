var _ = require('lodash');

var module = require('ui/modules').get('vectormap');

module.controller('VectormapController', function ($scope) {
  $scope.$watch('esResponse', function (resp) {
    if (!resp || !resp.aggregations) {
      $scope.data = null;
      return;
    }

    var geoCodeAggId = _.first(_.pluck($scope.vis.aggs.bySchemaName['segment'], 'id'));
    var geoCodAgg = _.first($scope.vis.aggs.bySchemaName['segment']);
    var metricsAgg = _.first($scope.vis.aggs.bySchemaName['metric']);
    var buckets = resp.aggregations[geoCodeAggId] && resp.aggregations[geoCodeAggId].buckets;

    $scope.filterField = geoCodAgg._opts.params.field;
    $scope.data = {};

    buckets.forEach(function (bucket) {
      var prefix = $scope.vis.params.mapType === 'us_aea' ? 'US-' : '';
      $scope.data[prefix + bucket.key.toUpperCase()] = metricsAgg.getValue(bucket);
    });
  });
});
