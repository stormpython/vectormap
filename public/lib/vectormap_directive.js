var _ = require('lodash');
var $ = require('jquery');
var numeral = require('numeral');

// jvectormap - version 2.0.3
require('plugins/vectormap/lib/jvectormap/jquery-jvectormap.min');
require('plugins/vectormap/lib/jvectormap/jquery-jvectormap.css');

var module = require('ui/modules').get('vectormap');

module.directive('vectormap', function (Private, getAppState, courier) {
  function link (scope, element) {
    const pushFilter = Private(require('ui/filter_bar/push_filter'))(getAppState());

    function onSizeChange() {
      return {
        width: element.parent().width(),
        height: element.parent().height()
      };
    }

    function displayFormat(val) {
      var formats = {
        number: '0[.]0a',
        bytes: '0[.]0b',
        currency: '$0[.]00a',
        percentage: '0%'
      }

      return formats[val] || formats.number;
    }

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

    function render() {
      element.css({
        height: element.parent().height(),
        width: '100%'
      });

      element.text('');

      // Remove previously drawn vector map
      $('.jvectormap-zoomin, .jvectormap-zoomout, .jvectormap-label').remove();

      require(['plugins/vectormap/lib/jvectormap/maps/map.' + scope.options.mapType], function () {
        element.vectorMap({
          map: scope.options.mapType,
          regionStyle: { initial: { fill: '#8c8c8c' }},
          zoomOnScroll: scope.options.zoomOnScroll,
          backgroundColor: null,
          series: {
            regions: [{
              values: scope.data,
              scale: [scope.options.minColor, scope.options.maxColor],
              normalizeFunction: 'polynomial'
            }]
          },
          onRegionTipShow: function(event, el, code) {
            if (!scope.data) { return; }

            var count = _.isUndefined(scope.data[code]) ? 0 : scope.data[code];
            el.html(el.html() + ": " + numeral(count).format(displayFormat(scope.options.tipNumberFormat)));
          },
          onRegionClick: function(event, code) {
            if (!scope.$parent.filterField) {
              return;
            }
            var count = _.isUndefined(scope.data[code]) ? 0 : scope.data[code];
            if (count !== 0) {
              courier.indexPatterns.getIds().then(function (indices) {
                const field = scope.$parent.filterField;
                const filter = {"match" : {}};
                filter.match[field] = code;

                for(var i = 0; i < indices.length; i++) {
                  pushFilter(filter, false, indices[i]);
                }
              });
            }
          }
        });
      });
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
