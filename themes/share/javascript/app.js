var shareApp = angular.module('shareApp', [
	'ngAnimate',
	'ngCookies',
	'ngRoute',
	'ngTouch',
	'infinite-scroll'
]);

/* Values */

shareApp.value('postsPerPage', '18');
shareApp.value('soundcloudClientId', 'a12345654321x');

shareApp.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.
		when('/about', {
      templateUrl: 'share/about/',
      controller: 'About'
    }).
		when('/add', {
	        templateUrl: 'share/newPost/',
	        controller: 'NewPost'
	    }).
		when('/edit/:postId', {
      templateUrl: 'share/newpost/',
      controller: 'PostEdit'
	  }).
		when('/genre/:genreId', {
	    templateUrl: 'share/posts/',
			controller: 'PostListGenre'
		}).
		when('/likes/', {
	    templateUrl: 'share/posts/',
			controller: 'PostListLikes'
		}).
		when('/login', {
	    templateUrl: 'share/login/',
			controller: 'Login'
	  }).
    when('/playlist/tag/:tag', {
	    templateUrl: 'share/playlist/',
			controller: 'Playlist'
    }).
    when('/post/:postId', {
      templateUrl: 'share/post/',
      controller: 'PostDetails'
		}).
		when('/posts', {
      templateUrl: 'share/posts/',
      controller: 'PostList'
    }).
		when('/search/:searchString', {
	        templateUrl: 'share/search/',
	        controller: 'Search'
	    }).
		when('/share', {
	        templateUrl: 'share/newpost/',
	        controller: 'NewPost'
	    }).
		when('/tag/:tag', {
      templateUrl: 'share/posts/',
      controller: 'PostListTag'
    }).
		when('/user/:userId', {
	    templateUrl: 'share/posts/',
			controller: 'PostListUser'
		}).
		otherwise({
		  redirectTo: 'posts/'
		});
	}]
);