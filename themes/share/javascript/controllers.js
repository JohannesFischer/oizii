'use strict';

/* Factories */

shareApp.factory('pageFactory', function($http, $cookies, $location) {
	var defaultTitle = 'oizii';
	return {
		resetTitle: function () {
			document.title = defaultTitle;
		},
		setLastVisited: function (postId) {
			$cookies.lastVisited = $location.url();
			//return $http.get('data/lastVisited?postId=' + postId);
		},
		setTitle: function(newTitle) {
			document.title = defaultTitle + ' :: ' + newTitle;
		}
	};
});

shareApp.factory('postFactory', ['$http', '$location', function ($http, $location) {
	return {
		cleanBCLink: function (link) {
			if (link !== undefined && (link).indexOf('bandcamp.com/EmbeddedPlayer/') > -1) {
				var regex = /<iframe.*?src="(.*?)"/;
				var match = regex.exec(link);
				if (match[1]) {
					return match[1];
				}
				return false;
			}
			return false;
		},
		getPost: function(parameter) {
			parameter = parameter !== undefined ? '?' + parameter : '';
			return $http.get('data/getPost' + parameter);
		},
		getPosts: function(parameter) {
			parameter = parameter !== undefined ? '?' + parameter : '';
			return $http.get('data/getPosts' + parameter);
		},
		submitPost: function (formData) {
			$http({
				url: '/data/newPost/',
				method: "POST",
				data: formData,
				headers: {'Content-Type': 'application/json'}
			}).success(function(data) {
				if (data.ID === undefined) {
					$scope.error = true;
				} else {
					$location.path('/post/' + data.ID);
				}
			});
		}
	}
}]);

/* Controllers */

// About
shareApp.controller('About', function ($scope, $http, pageFactory) {
	$scope.genres = [];
	pageFactory.setTitle('About');
	
	$http.get('data/getGenreStats').success(function (data) {
		$scope.genres = data[0].Genres;
	});
});

// Login
shareApp.controller('Login', function ($scope, $http, $cookies, pageFactory) {
	$scope.error = false;
	
	$http.get('data/isLoggedIn').success(function (data) {
		if (data.User !== undefined) {
			window.location.href = '/';
		}
	});
	
	pageFactory.setTitle('Login');
	
	$scope.login = function() {
		$scope.error = false;
		
		var mail = angular.element(document.querySelector('#Email'));
		var pass = angular.element(document.querySelector('#Password'));
		
		var postData = {
			email: mail.val(),
			password: pass.val()
		};
		
		// validation
		
		$http({
			url: '/data/login/',
			method: "POST",
			data: postData,
			headers: {'Content-Type': 'application/json'}
		}).success(function(data) {
			if (data.User === undefined) {
				$scope.error = true;
			} else {
				var url = '/';
				if ($cookies.lastVisited) {
					url = '#' + $cookies.lastVisited
				}
				window.location.href = url;
			}
		});
	};
});

// PostList
shareApp.controller('PostList', ['$scope', 'postFactory', 'postsPerPage', 'pageFactory',
	function ($scope, postFactory, postsPerPage, pageFactory) {
		var start = 0;
		// toggle Intro text
		$scope.showIntro = true;
		$scope.posts = [];
		$scope.infiniteBusy = false;
		pageFactory.resetTitle();
		
		$scope.loadMore = function() {
			$scope.infiniteBusy = true;
			
			postFactory.getPosts('limit=' + postsPerPage + '&start=' + start).success(function (data) {
				if (data.length > 0) {
					for (var i = 0; i < data.length; i++) {
						$scope.posts.push(data[i]);
					}
					$scope.infiniteBusy = false;
					start += data.length;
				} else {
					$scope.hideLoader = true;
				}
			}).error(function () {
				// handle error
			});
		};
	}
]);

// PostList by Genre
shareApp.controller('PostListGenre', ['$scope', '$routeParams', 'postFactory', 'postsPerPage', 'pageFactory',
	function ($scope, $routeParams, postFactory, postsPerPage, pageFactory) {
		var start = 0;
		$scope.loading = true;
		$scope.posts = [];
		$scope.infiniteBusy = false;
		pageFactory.resetTitle();
		
		$scope.loadMore = function() {
			$scope.infiniteBusy = true;
			
			postFactory.getPosts('limit=' + postsPerPage + '&genreId=' + $routeParams.genreId + '&start=' + start).success(function (data) {
				if (data.length > 0) {
					if ($scope.posts.length == 0) {
						$scope.pageTitle = data[0].Genre.Title;
						pageFactory.setTitle(data[0].Genre.Title);
					}					
					for (var i = 0; i < data.length; i++) {
						$scope.posts.push(data[i]);
					}
					$scope.infiniteBusy = false;
					start += data.length;
				} else {
					$scope.hideLoader = true;
				}
			}).error(function () {
				// handle error
			});
		};
	}
]);

// PostList by Tag
shareApp.controller('PostListTag', ['$scope', '$routeParams', 'postFactory', 'postsPerPage', 'pageFactory',
	function ($scope, $routeParams, postFactory, postsPerPage, pageFactory) {
		var start = 0;
		$scope.loading = true;
		$scope.posts = [];
		$scope.infiniteBusy = false;
		$scope.pageTitle = '#' + $routeParams.tag;
		pageFactory.setTitle('tag #' + $routeParams.tag);
		
		$scope.loadMore = function() {
			$scope.infiniteBusy = true;
			
			postFactory.getPosts('limit=' + postsPerPage + '&tag=' + $routeParams.tag + '&start=' + start).success(function (data) {
				for (var i = 0; i < data.length; i++) {
					$scope.posts.push(data[i]);
				}
				$scope.loading = false;
				$scope.infiniteBusy = false;
				start += data.length;
			}).error(function () {
				// handle error
			});
		};
	}
]);

// PostList by User
shareApp.controller('PostListUser', ['$scope', '$routeParams', 'postFactory', 'postsPerPage', 'pageFactory',
	function ($scope, $routeParams, postFactory, postsPerPage, pageFactory) {
		var start = 0;
		$scope.loading = true;
		$scope.posts = [];
		pageFactory.resetTitle();
		$scope.infiniteBusy = false;
		
		$scope.loadMore = function() {
			$scope.infiniteBusy = true;
		
			postFactory.getPosts('userId=' + $routeParams.userId + '&limit=' + postsPerPage + '&start=' + start).success(function (data) {
				if (data.length > 0) {
					if ($scope.posts.length == 0) {
						$scope.pageTitle = 'Posts by ' + data[0].User.Name;
						pageFactory.setTitle(data[0].User.Name);
					}					
					for (var i = 0; i < data.length; i++) {
						$scope.posts.push(data[i]);
					}
					$scope.infiniteBusy = false;
					start += data.length;
				} else {
					$scope.hideLoader = true;
				}
			});
		}
	}
]);

// PostList User Likes
shareApp.controller('PostListLikes', ['$scope', 'postFactory', 'postsPerPage', 'pageFactory',
	function ($scope, postFactory, postsPerPage, pageFactory) {
		var start = 0;
		$scope.infiniteBusy = false;
		$scope.posts = [];
		$scope.pageTitle = 'Your Likes';
		pageFactory.setTitle('Your Likes');
		
		$scope.loadMore = function() {
			$scope.infiniteBusy = true;
			
			postFactory.getPosts('likes=1&limit=' + postsPerPage + '&start=' + start).success(function (data) {
				for (var i = 0; i < data.length; i++) {
					$scope.posts.push(data[i]);
				}
				$scope.loading = false;
				$scope.infiniteBusy = false;
				start += data.length;
			}).error(function () {
				// handle error
			});
		};
	}
]);

// Post Add
shareApp.controller('NewPost', function ($scope, postFactory) {
	$scope.loading = false;
	$scope.post = {};
	
	$scope.submitPost = function(post) {
		postFactory.submitPost(post);
	};
	
	// checking for pasted Bandcamp iframe source end extracts src
	$scope.cleanBCLink = function () {
		var bcLink = postFactory.cleanBCLink($scope.post.Link);
		
		if (bcLink !== false) {
			$scope.post.Link = bcLink;
		}
	};
	
	$scope.isUnchanged = function (post) {
		return false;
	};
});

// Post Edit
shareApp.controller('PostEdit', function ($scope, $http, $location, $routeParams, postFactory) {
	$scope.loading = true;
	$scope.master = {};
	$scope.post = {};

	$http.get('data/getPost/' + $routeParams.postId + '?edit=1').success(function(data) {
		$scope.loading = false;
		
		if (data.CanEdit !== true) {
			$location.path('/');
		}
		
		$scope.post = data;
		$scope.master = angular.copy($scope.post);
	});
	
	// checking for changes on scope
	$scope.isUnchanged = function (post) {
		return angular.equals(post, $scope.master);
	};
	
	// cancel editing and return to post
	$scope.cancelEdit = function (post) {
		if ($scope.isUnchanged(post) === false) {
			if (confirm('Do you want to discard your changes?'))
			$location.path('/post/' + post.ID);
		} else {
			$location.path('/post/' + post.ID);
		}
	};
	
	// checking for pasted Bandcamp iframe source end extracts src
	$scope.cleanBCLink = function () {
		var bcLink = postFactory.cleanBCLink($scope.post.Link);
		
		if (bcLink !== false) {
			$scope.post.Link = bcLink;
		}
	};
	
	// submit changed post
	$scope.submitPost = function(post) {	
		postFactory.submitPost(post);
	};
});

// Post Details
shareApp.controller('PostDetails', ['soundcloudClientId', '$scope', '$routeParams', '$http', '$sce', 'postFactory', 'pageFactory',
	function(soundcloudClientId, $scope, $routeParams, $http, $sce, postFactory, pageFactory) {
		$scope.loading = true;
		$scope.commentFrombusy = false;
		
		$http.get('data/getPost/' + $routeParams.postId).success(function(data) {
			$scope.loading = false;
			$scope.post = data;
			$scope.post.Content = $sce.trustAsHtml(data.Content);
			pageFactory.setTitle(data.Title);
			
			for(var i = 0; i < $scope.post.Comments.length; i++) {
				var content = $sce.trustAsHtml($scope.post.Comments[i].Content);
				$scope.post.Comments[i].Content = content;
			}
			
			// init Player
			if (data.YouTubeID !== null) {
				// YouTube
				$scope.frameURL = $sce.trustAsResourceUrl('http://www.youtube.com/embed/' + data.YouTubeID);
			} else if (data.DailyMotionID !== null) {
				// Daily Motion
				$scope.frameURL = $sce.trustAsResourceUrl('http://www.dailymotion.com/embed/video/' + data.DailyMotionID);
			} else if (data.VimeoID !== null) {
				// Vimeo
				$scope.frameURL = $sce.trustAsResourceUrl('http://player.vimeo.com/video/' + data.VimeoID);
			} else if (data.Link != null && data.Link.indexOf('soundcloud') > -1) {
				// SoundCloud
				var e = angular.element(document.querySelector('iframe'));
				e.replaceWith('<div id="SoundcloudPlayer"/>');
				embedSoundcloud(soundcloudClientId, data.Link);
			} else if (data.BandcampAlbumID !== null) {
				// Bandcamp
				$scope.frameURL = $sce.trustAsResourceUrl('http://bandcamp.com/EmbeddedPlayer/album=' + data.BandcampAlbumID + '/size=large/bgcol=333333/linkcol=0f91ff/transparent=true/t=' + data.BandcampTrack);
			} else {
				// shows error message / hides player
				$scope.loadingError = true;
			}
			
			// Posts by GenreID
			postFactory.getPosts('limit=5&random=1&genreId=' + $scope.post.Genre.ID + '&exclude=' + $scope.post.ID).success(function (data) {
				$scope.postsGenre = data;
			});
			// Posts by UserID
			postFactory.getPosts('limit=5&random=1&userId=' + $scope.post.User.ID + '&exclude=' + $scope.post.ID).success(function (data) {
				$scope.postsUser = data;
			});
			
			// set last visited page
			pageFactory.setLastVisited($routeParams.postId);
			
			// controller functions
			
			$scope.sendComment = function () {
				$scope.commentFrombusy = true;
				var commentField = angular.element(document.querySelector('input[name=CommentText]'));
				
				var data = {
					ID: $scope.post.ID,
					Text: commentField[0].value.trim()
				};
				
				if (data.Text === '') return;
				
				$http({
					url: '/data/comment/',
					method: "POST",
					data: data,
					headers: {'Content-Type': 'application/json'}
				}).success(function (data) {
					$scope.post.Comments = data;
					
					for(var i = 0; i < data.length; i++) {
						$scope.post.Comments[i].Content = $sce.trustAsHtml(data[i].Content);
					}
					
					$scope.commentFrombusy = false;
					commentField[0].value = '';
				});
			};
			
			$scope.sendLike = function () {
				$http.get('data/like/?postId=' + $scope.post.ID).success(function (data) {
					// check if like count is in or decreased
					$scope.post.HasLiked = data.Likes > $scope.post.Likes;
					
					$scope.post.Likes = data.Likes;
				});
			};
			
			// touch / swipe functions
			
			$scope.nextPost = function () {
				
			};
		});
	}
]);