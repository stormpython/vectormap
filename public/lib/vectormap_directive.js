const _ = require('lodash');
const $ = require('jquery');

// jvectormap - version 2.0.3
require('plugins/vectormap/lib/jvectormap/jquery-jvectormap.min');

const module = require('ui/modules').get('vectormap');

module.directive('vectorMap', function () {
  function link (scope, element) {

    element.html('<center><img src="img/load_big.gif"></center>');

    scope.$watch('data',function(){
      render();
    });

    scope.$watch('options',function(){
      render();
    });

    scope.$watch(onSizeChange, _.debounce(function () {
      render();
    }, 250), true);

    // Re-render if the window is resized
    angular.element(window).bind('resize', function(){
      render();
    });

    element.bind('resize', function () {
      scope.$apply();
    });

    function onSizeChange() {
      return { width: element.width(), height: element.height() };
    }

    function render() {
      element.css({ height: element.height() });

      element.text('');

      $('.jvectormap-zoomin, .jvectormap-zoomout, .jvectormap-label').remove();
      element.vectorMap({
        map: scope.options.mapType,
        regionStyle: { initial: { fill: '#8c8c8c' }},
        zoomOnScroll: false,
        backgroundColor: null,
        series: {
          regions: [{
            values: scope.data,
            scale: scope.options.colors,
            normalizeFunction: 'polynomial'
          }]
        },
        onRegionLabelShow: function(event, label, code) {
          element.children('.map-legend').show();
          var count = _.isUndefined(scope.data[code]) ? 0 : scope.data[code];
          element.children('.map-legend').text(label.text() + ": " + count);
        },
        onRegionOut: function() {
          $('.map-legend').hide();
        },
        // onRegionClick: function(event, code) {
        //   var count = _.isUndefined(scope.data[code]) ? 0 : scope.data[code];
        //   if (count !== 0) {
        //     scope.build_search(scope.panel.field, code);
        //   }
        // }
      });

      element.prepend('<span class="map-legend"></span>');

      $('.map-legend').hide();
    }
  }

  return {
    restrict: 'E',
    scope: {
      data: '=',
      options: '='
    },
    link: link
  };
});
