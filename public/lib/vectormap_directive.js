var _ = require('lodash');
var $ = require('jquery');

// jvectormap - version 2.0.3
require('plugins/vectormap/lib/jvectormap/jquery-jvectormap.min');
require('plugins/vectormap/lib/jvectormap/jquery-jvectormap.css');

var module = require('ui/modules').get('vectormap');

module.directive('vectormap', function () {
  function link (scope, element) {

    //element.html('<center><img src="img/load_big.gif"></center>');

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
      return { width: element.parent().width(), height: element.parent().height() };
    }

    function render() {
      element.css({ 
        height: element.parent().height(), 
        width: element.parent().width()
      });

      element.text('');

      $('.jvectormap-zoomin, .jvectormap-zoomout, .jvectormap-label').remove();
      
      require(['plugins/vectormap/lib/jvectormap/maps/map.' + scope.options.mapType], function () {
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
          }
        });
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
