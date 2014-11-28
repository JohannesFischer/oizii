'use strict';

/* Factories */

shareApp.factory('pageFactory', function($http, $cookies, $location) {
	var defaultTitle = 'oizii :: share delicous music';
	return {
		resetTitle: function () {
			document.title = defaultTitle;
		},
		setLastVisited: function (postId) {
			$cookies.lastVisited = $location.url();
		},
		setTitle: function(newTitle) {
			document.title = newTitle + ' :: ' + defaultTitle;
		}
	};
});

shareApp.factory('postFactory', ['$http', '$location', '$q', '$log', function ($http, $location, $q, $log) {
	return {
		cleanBCLink: function (link) {
			if (link !== undefined && ( (link).indexOf('bandcamp.com/EmbeddedPlayer/') > -1 || (link).indexOf('8tracks.com/') > -1) ) {
				var regex = /<iframe.*?src="(.*?)"/;
				var match = regex.exec(link);
				if (match[1]) {
					return match[1];
				}
				return false;
			}
			return false;
		},
		getPost: function(id) {
			$http.get('data/getPost/' + id).success(function (data) {
        return data;
      });
		},
		getPosts: function(parameter) {
      var deferred = $q.defer();
      $http.get('data/getPosts' + parameter).success(function(data) {
        deferred.resolve(data);
      }).error(function(msg, code) {
         deferred.reject(msg);
         $log.error(msg, code);
      });
      return deferred.promise;
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

/* Provider */

shareApp.provider('postService', function() {
  var data, promise;
  
  data = {
    error: false,
    infiniteBusy: false,
    loading: false,
    posts: [],
    title: null,
    start: 0
  };

  this.$get = function(postFactory, postsPerPage, $log) {
    return {
      data: data,
      add: function (item) {
        data.posts.push(item);
      },
      getPosts: function (parameter) {
        // disable infinte-scroll
        data.infiniteBusy = true;
        data.loading = true;
        
        // add URL params
        parameter = parameter === undefined ? '?' : '?' + parameter + '&';
        parameter += 'limit=' + postsPerPage;
        parameter += data.start > 0 ? '&start=' + data.start : '';
        
        postFactory.getPosts(parameter).then(
          function(response) {
            if (response.length > 0) {
              for (var i = 0; i < response.length; i++) {
                data.posts.push(response[i]);
              }
              // if less posts returned than perPage
              if (response.length != postsPerPage) {
                data.loading = false;
              } else {
                data.start += response.length;
                data.infiniteBusy = false;
              }
            } else {
              data.loading = false;
            }
          },
          function(errorPayload) {
            data.error = true;
            $log.error('failure loading movie', errorPayload);
          });
      },
      getValue: function (obj) {
        return data['posts'];
      },
      clear: function () {
        data.posts = [];
        data.start = 0;
        data.infiniteBusy = false;
        data.loading = false;
      },
      setTitle: function (title) {
        data.title = title;
      }
    };
  };
});

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
        $route.reload();
			}
		});
	};
});

// PostList
shareApp.controller('PostList', ['$scope', 'postService', 'pageFactory',
	function ($scope, postService, pageFactory) {
    $scope.data = postService.data;
    postService.clear();
    
		// toggle Intro text
		$scope.showIntro = true;
		$scope.hideFilters = true;

		pageFactory.resetTitle();
    
		$scope.loadMore = function () {
      postService.getPosts();
    };
		
		$scope.toggleFilters = function () {
			$scope.hideFilters = ! $scope.hideFilters;
		};
	}
]);

// PostList by Genre
shareApp.controller('PostListGenre', ['$scope', '$routeParams', 'postService', 'pageFactory',
	function ($scope, $routeParams, postService, pageFactory) {
		$scope.data = postService.data;
    postService.clear();
		// todo set title
    pageFactory.resetTitle();
		
		$scope.loadMore = function() {
      postService.getPosts('genreId=' + $routeParams.genreId);
		};
    
    $scope.title = postService.getValue('posts[0].Genre.Title');
	}
]);

// PostList by Tag
shareApp.controller('PostListTag', ['$scope', '$routeParams', 'postService', 'pageFactory',
	function ($scope, $routeParams, postService, pageFactory) {
		$scope.data = postService.data;
    $scope.showPlaytag = true;
    $scope.tag = $routeParams.tag;
    postService.clear();
		
    pageFactory.resetTitle();
		
		$scope.loadMore = function() {
      postService.getPosts('tag=' + $routeParams.tag);
		};
    
		$scope.pageTitle = '#' + $routeParams.tag;
		pageFactory.setTitle('tag #' + $routeParams.tag);
	}
]);

// PostList by User
shareApp.controller('PostListUser', ['$scope', '$routeParams', 'postService', 'pageFactory',
	function ($scope, $routeParams, postService, pageFactory) {
		$scope.data = postService.data;
    postService.clear();
		// todo set title
    pageFactory.resetTitle();
		
		$scope.loadMore = function() {
      postService.getPosts('userId=' + $routeParams.userId);
		};
	}
]);

// PostList User Likes
shareApp.controller('PostListLikes', ['$scope', 'postService', 'pageFactory',
  function ($scope, postService, pageFactory) {
    $scope.data = postService.data;
    postService.clear();
    
    $scope.pageTitle = 'Your Likes';
		pageFactory.setTitle('Your Likes');
    
		$scope.loadMore = function () {
      postService.getPosts('likes=1');
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
	$scope.edit = true;
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
		$scope.likeUsers = null;
		$scope.loading = true;
		$scope.commentFrombusy = false;
    // todo test if that stuff works
    window.scrollTo(0, 0);
		
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
			} else if (data.EightTracksID !== null) {
				// 8Tracks
				$scope.frameURL = $sce.trustAsResourceUrl('http://8tracks.com/mixes/' + data.EightTracksID + '/player_v3_universal');
			} else {
				// shows error message / hides player
				$scope.loadingError = true;
			}
			
			// Posts by GenreID
      postFactory.getPosts('?limit=5&random=1&genreId=' + $scope.post.Genre.ID + '&exclude=' + $scope.post.ID).then(
        function(response) {
          $scope.postsGenre = response;
        },
        function(errorPayload) {
          //$log.error('failure loading movie', errorPayload);
        });
			
			// Posts by UserID
      postFactory.getPosts('?limit=5&random=1&userId=' + $scope.post.User.ID + '&exclude=' + $scope.post.ID).then(
        function(response) {
          $scope.postsUser = response;
        },
        function(errorPayload) {
          //$log.error('failure loading movie', errorPayload);
        });
			
			// set last visited page
			pageFactory.setLastVisited($routeParams.postId);
			
			// controller functions
			
			$scope.getLikes = function () {
				if ($scope.likeUsers === null && $scope.post.Likes > 0) {
					$http.get('data/getLikes/' + $scope.post.ID ).success(function (data) {
						var usr = [];
						for (var i = 0; i < data.length; i++) {
							usr.push(data[i].User.Name);
						}
						$scope.likeUsers = usr.join(', ');
					});
				}
			};
			
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

// Playlist
shareApp.controller('Playlist', ['$scope', '$http', '$routeParams', '$document', '$window', 'postFactory', 'pageFactory',
	function ($scope, $http, $routeParams, $document, $window, postFactory, pageFactory) {
  $scope.currentIndex = 0;
	$scope.loading = true;
  $scope.noposts = false;
  $scope.post = {};
	$scope.posts = [];
  $scope.tag = $routeParams.tag;
  
	var tag = $document[0].createElement('script');
	tag.src = "https://www.youtube.com/iframe_api";
	var firstScriptTag = $document[0].getElementsByTagName( 'script' )[0];
	firstScriptTag.parentNode.insertBefore( tag, firstScriptTag );
	
  $window.onYouTubePlayerAPIReady = function() {
    $window.player = new YT.Player('Player', {
      height: '390',
      width: '100%',
      //videoId: $scope.posts[$scope.currentIndex].YouTubeID,
      events: {
        'onReady': function(event) {
          $scope.getPosts();
        },
        'onStateChange': function(event) {
          if (event.target.getPlayerState() === 0) {
            var nextIndex = $scope.posts[($scope.currentIndex + 1)] != undefined ? ($scope.currentIndex + 1) : -1;
            if (nextIndex > -1) {
              $scope.play(nextIndex);
            }
          }
        }
      },
      title: 'video'
    });
  };
  
  $scope.play = function (index) {
    console.log(index);
    $scope.currentIndex = index;
    $scope.post = $scope.posts[index];
    $window.player.loadVideoById($scope.posts[index].YouTubeID);
  };
  
  // get posts
  $scope.getPosts = function () {
    postFactory.getPosts('?tag=' + $routeParams.tag + '&youtube=1').then(function(data) {
      for (var i = 0; i < data.length; i++) {
        $scope.posts.push(data[i]);
      }
      $scope.loading = false;
      if (data.length > 0) {
        //$scope.post = postFactory.getPost($scope.posts[0].ID);
        $scope.post = $scope.posts[0];
        $scope.play(0);
      } else {
        $scope.noposts = true;
      }
    });
  }
}]);

// Search
shareApp.controller('Search', ['$scope', '$routeParams', '$location', 'postService', 'pageFactory',
	function ($scope, $routeParams, $location, postService, pageFactory) {
    $scope.data = postService.data;
    
		// todo set title
		pageFactory.resetTitle();
    
    if ($routeParams.searchString != undefined) {
      postService.clear();
      $scope.loadMore = function() {
        postService.getPosts('search=' + $routeParams.searchString);
      };
    }
    
		$scope.search = function () {
      $location.path('/search/' + $scope.searchString);
    };
	}
]);