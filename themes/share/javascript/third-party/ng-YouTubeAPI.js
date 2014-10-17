/* ng-YouTubeAPI.js v1.1.0
 * https://github.com/patrickmarabeas/ng-YouTubeAPI.js
 *
 * Copyright 2013, Patrick Marabeas http://pulse-dev.com
 * Released under the MIT license
 * http://opensource.org/licenses/mit-license.php
 *
 * Date: 03/12/2013
 */

var module = angular.module( 'ngYouTubeAPI', [] );

module.run( [ '$window', '$document', '$rootScope', function( $window, $document, $rootScope ) {
	var tag = $document[0].createElement('script');
	tag.src = "https://www.youtube.com/iframe_api";
	var firstScriptTag = $document[0].getElementsByTagName( 'script' )[0];
	firstScriptTag.parentNode.insertBefore( tag, firstScriptTag );

	$window.onYouTubePlayerAPIReady = function() {
		$rootScope.$broadcast('onYouTubePlayerAPIReady');
	};
}]);

module.service('constructor', [function() {
	return {
		players: [],
		construct: function(id, vid, vars) {
			this.players[id] = new YT.Player( id, {
				height: '390',
				width: '100%',
				videoId: vid,
				playerVars: vars,
				events: {
					'onReady': function(event) {
						event.target.playVideo();
					},
					'onStateChange': function(event) {
						if (event.target.getPlayerState() === 0) {
							console.log('next');
						}
					}
				},
				title: 'sup'
			});
		}
	}
}]);

module.directive( 'ytPlayer', [ 'constructor', function( constructor ) {
	return {
		restrict: 'A',
		scope: {
			player: '@ytPlayer',
			vid: '@ytVid'
		},
		controller: [ '$scope', '$http', function( $scope, $http ) {
			$scope.$watch( 'vid', function() {
				$http( {
					url: '/data/getPost/304'
				}).success(function( data, status ) {
					console.log(data.Title);
					//constructor.players[$scope.player].post = data;
					$scope.post = data;
					//constructor.players[$scope.player].title = data.Title;
					//$scope.title = data.Title;
				}).error( function() {
					
				});
			});

		}],
		template: '<div id="{{ player }}"></div><div class="post-info"><h2>{{ post.Title }}</div>',
		//templateURL: '/share/player/',
		replace: false,
		link: function( scope, element, attrs ) {
			scope.$on('onYouTubePlayerAPIReady', function( events, args ) {
				var vars = eval("("+attrs.ytPlayervars+")");
				constructor.construct( attrs.ytPlayer, attrs.ytVid, vars );
				console.log('API ready');
			});
			scope.$on( attrs.ytPlayer, function( events, args ) {
				constructor.players[events.name].loadVideoById( args.vid );

				scope.$apply( function() {
					scope.vid = args.vid;
				});
			});
		}
	}
}]);

module.directive('ytPlayto', [ '$rootScope', function( $rootScope ) {
	return {
		restrict: 'A',
		scope: {
			playto: '@ytPlayto',
			vid: '@ytVid'
		},
		controller: [ '$scope', '$http', function( $scope, $http ) {
			
		}],
		link: function( scope, element, attrs) {
			angular.element(element).bind('click', function() {
				$rootScope.$broadcast( scope.playto, {
					'vid': scope.vid
				});
			});
		}
	}
}]);

module.directive( 'ytSpy', [ 'constructor', function( constructor ) {
	return {
		scope: {
			spy: '@ytSpy',
			value: '@ytValue'
		},
		template: '<span>{{data}}</span>',
		replace: true,
		link: function( scope, element, attrs ) {
			angular.element( document ).ready( function() {

				scope.player = constructor.players[scope.spy];
				scope.data = scope.player[scope.value];
				scope.$apply();

				scope.$watch( 'player.' + scope.value, function() {
					scope.data = constructor.players[scope.spy][scope.value];
				});

			});

		}
	}
}]);