'use strict';
shareApp.controller('About', function($scope, $http, pageFactory) {
  $scope.genres = [];
  pageFactory.setTitle('About');
  return $http({
    url: 'data/getGenreStats'
  }).success(function(data) {
    return $scope.genres = data[0].Genres;
  });
});

shareApp.controller('Login', function($scope, $http, $cookies, pageFactory) {
  $scope.error = false;
  $http({
    url: 'data/isLoggedIn'
  }).success(function(data) {
    if (data.User != null) {
      return window.location.href = '/';
    }
  });
  pageFactory.setTitle('Login');
  return $scope.login = function() {
    var mail, pass, postData;
    $scope.error = false;
    mail = angular.element(document.querySelector('#Email'));
    pass = angular.element(document.querySelector('#Password'));
    postData = {
      email: mail.val(),
      password: pass.val()
    };
    $http({
      url: '/data/login/',
      method: "POST",
      data: postData,
      headers: {
        'Content-Type': 'application/json'
      }
    }).success(function(data) {
      var url;
      if (data.User != null) {
        url = '/';
        if ($cookies.lastVisited) {
          url = '#' + $cookies.lastVisited;
        }
        return window.location.href = url;
      } else {
        return $scope.error = true;
      }
    });
    return $route.reload();
  };
});

shareApp.controller('PostList', function($scope, postService, pageFactory) {
  $scope.data = postService.data;
  postService.clear();
  $scope.showIntro = true;
  $scope.hideFilters = true;
  pageFactory.resetTitle();
  $scope.loadMore = function() {
    return postService.getPosts();
  };
  return $scope.toggleFilters = function() {
    return $scope.hideFilters = !$scope.hideFilters;
  };
});

shareApp.controller('PostListGenre', function($scope, $routeParams, postService, pageFactory) {
  $scope.data = postService.data;
  postService.clear();
  pageFactory.resetTitle();
  return $scope.loadMore = function() {
    postService.getPosts("genreId=" + $routeParams.genreId);
    return $scope.title = postService.getValue('posts[0].Genre.Title');
  };
});

shareApp.controller('PostListTag', function($scope, $routeParams, postService, pageFactory) {
  $scope.data = postService.data;
  $scope.showPlaytag = true;
  $scope.tag = $routeParams.tag;
  postService.clear();
  $scope.pageTitle = '#' + $routeParams.tag;
  pageFactory.setTitle('tag #' + $routeParams.tag);
  return $scope.loadMore = function() {
    return postService.getPosts("tag=" + $routeParams.tag);
  };
});

shareApp.controller('PostListUser', function($scope, $routeParams, postService, pageFactory) {
  $scope.data = postService.data;
  postService.clear();
  pageFactory.resetTitle();
  return $scope.loadMore = function() {
    return postService.getPosts('userId=' + $routeParams.userId);
  };
});

shareApp.controller('PostListLikes', function($scope, postService, pageFactory) {
  $scope.data = postService.data;
  postService.clear();
  $scope.pageTitle = 'Your Likes';
  pageFactory.setTitle('Your Likes');
  return $scope.loadMore = function() {
    return postService.getPosts('likes=1');
  };
});

shareApp.controller('NewPost', function($scope, postFactory) {
  $scope.loading = false;
  $scope.post = {};
  $scope.submitPost = function(post) {
    return postFactory.submitPost(post);
  };
  $scope.cleanBCLink = function() {
    var bcLink;
    bcLink = postFactory.cleanBCLink($scope.post.Link);
    if (bcLink !== false) {
      return $scope.post.Link = bcLink;
    }
  };
  return $scope.isUnchanged = function(post) {
    return false;
  };
});

shareApp.controller('PostEdit', function($scope, $http, $location, $routeParams, postFactory) {
  $scope.edit = true;
  $scope.loading = true;
  $scope.master = {};
  $scope.post = {};
  $http({
    url: "data/getPost/" + $routeParams.postId + "?edit=1"
  }).success(function(data) {
    $scope.loading = false;
    if (data.CanEdit !== true) {
      $location.path('/');
    }
    $scope.post = data;
    return $scope.master = angular.copy($scope.post);
  });
  $scope.isUnchanged = function(post) {
    return angular.equals(post, $scope.master);
  };
  $scope.cancelEdit = function(post) {
    if ($scope.isUnchanged(post) === false) {
      if (confirm('Do you want to discard your changes?')) {
        return $location.path('/post/' + post.ID);
      }
    } else {
      return $location.path('/post/' + post.ID);
    }
  };
  $scope.cleanBCLink = function() {
    var bcLink;
    bcLink = postFactory.cleanBCLink($scope.post.Link);
    if (bcLink !== false) {
      return $scope.post.Link = bcLink;
    }
  };
  return $scope.submitPost = function(post) {
    return postFactory.submitPost(post);
  };
});

shareApp.controller('PostDetails', function(soundcloudClientId, $scope, $routeParams, $http, $sce, postFactory, pageFactory) {
  $scope.likeUsers = null;
  $scope.loading = true;
  $scope.commentFrombusy = false;
  window.scrollTo(0, 0);
  return $http({
    url: 'data/getPost/' + $routeParams.postId
  }).success(function(data) {
    var content, e, genreUrl, i, userUrl, _i, _ref;
    $scope.loading = false;
    $scope.post = data;
    $scope.post.Content = $sce.trustAsHtml(data.Content);
    pageFactory.setTitle(data.Title);
    for (i = _i = 0, _ref = $scope.post.Comments.length; _i < _ref; i = _i += 1) {
      content = $sce.trustAsHtml($scope.post.Comments[i].Content);
      $scope.post.Comments[i].Content = content;
    }
    if (data.YouTubeID !== null) {
      $scope.frameURL = $sce.trustAsResourceUrl('http://www.youtube.com/embed/' + data.YouTubeID);
    } else if (data.DailyMotionID !== null) {
      $scope.frameURL = $sce.trustAsResourceUrl('http://www.dailymotion.com/embed/video/' + data.DailyMotionID);
    } else if (data.VimeoID !== null) {
      $scope.frameURL = $sce.trustAsResourceUrl('http://player.vimeo.com/video/' + data.VimeoID);
    } else if (data.Link !== null && data.Link.indexOf('soundcloud') > -1) {
      e = angular.element(document.querySelector('iframe'));
      e.replaceWith('<div id="SoundcloudPlayer"/>');
      embedSoundcloud(soundcloudClientId, data.Link);
    } else if (data.BandcampAlbumID !== null) {
      $scope.frameURL = $sce.trustAsResourceUrl('http://bandcamp.com/EmbeddedPlayer/album=' + data.BandcampAlbumID + '/size=large/bgcol=333333/linkcol=0f91ff/transparent=true/t=' + data.BandcampTrack);
    } else if (data.EightTracksID !== null) {
      $scope.frameURL = $sce.trustAsResourceUrl('http://8tracks.com/mixes/' + data.EightTracksID + '/player_v3_universal');
    } else {
      $scope.loadingError = true;
    }
    genreUrl = "?limit=5&random=1&genreId=" + $scope.post.Genre.ID + "&exclude=" + $scope.post.ID;
    postFactory.getPosts(genreUrl).then(function(response) {
      return $scope.postsGenre = response;
    }, function(errorPayload) {
      return $log.error('failed loading posts', errorPayload);
    });
    userUrl = "?limit=5&random=1&userId=" + $scope.post.User.ID + "&exclude=" + $scope.post.ID;
    postFactory.getPosts(userUrl).then(function(response) {
      return $scope.postsUser = response;
    }, function(errorPayload) {
      return $log.error('failure loading movie', errorPayload);
    });
    pageFactory.setLastVisited($routeParams.postId);
    $scope.getLikes = function() {
      if ($scope.likeUsers === null && $scope.post.Likes > 0) {
        return $http({
          url: 'data/getLikes/' + $scope.post.ID
        }).success(function(data) {
          var usr, _j, _ref1;
          usr = [];
          for (i = _j = 0, _ref1 = data.length; _j < _ref1; i = _j += 1) {
            usr.push(data[i].User.Name);
          }
          return $scope.likeUsers = usr.join(', ');
        });
      }
    };
    $scope.sendComment = function() {
      var commentField;
      $scope.commentFrombusy = true;
      commentField = angular.element(document.querySelector('input[name=CommentText]'));
      data = {
        ID: $scope.post.ID,
        Text: commentField[0].value.trim()
      };
      if (data.Text === '') {
        return;
      }
      return $http({
        url: '/data/comment/',
        method: "POST",
        data: data,
        headers: {
          'Content-Type': 'application/json'
        }
      }).success(function(data) {
        var _j, _ref1;
        $scope.post.Comments = data;
        for (i = _j = 0, _ref1 = data.length; _j < _ref1; i = _j += 1) {
          $scope.post.Comments[i].Content = $sce.trustAsHtml(data[i].Content);
        }
        $scope.commentFrombusy = false;
        return commentField[0].value = '';
      });
    };
    $scope.sendLike = function() {
      return $http({
        url: 'data/like/?postId=' + $scope.post.ID
      }).success(function(data) {
        $scope.post.HasLiked = data.Likes > $scope.post.Likes;
        return $scope.post.Likes = data.Likes;
      });
    };
    return $scope.nextPost = function() {};
  });
});

shareApp.controller('Playlist', function($scope, $http, $routeParams, $document, $window, postFactory, pageFactory) {
  var firstScriptTag, tag;
  tag = $document[0].createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  firstScriptTag = $document[0].getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  $scope.currentIndex = -1;
  $scope.loading = true;
  $scope.post = {};
  $scope.posts = [];
  $scope.tag = $routeParams.tag;
  pageFactory.setTitle('#' + $routeParams.tag + ' playlist');
  $scope.play = function(index) {
    $scope.post = $scope.posts[index];
    $scope.currentIndex = index;
    return $window.player.loadVideoById($scope.posts[index].YouTubeID);
  };
  $scope.applyAndPlay = function(index) {
    $scope.$apply(function() {
      $scope.post = $scope.posts[index];
      return $scope.currentIndex = index;
    });
    return $scope.play(index);
  };
  $scope.getPosts = function() {
    return postFactory.getPosts('?tag=' + $routeParams.tag + '&youtube=1').then(function(data) {
      var i, _i, _ref;
      $scope.loading = false;
      for (i = _i = 0, _ref = data.length; _i < _ref; i = _i += 1) {
        $scope.posts.push(data[i]);
      }
      if (data.length > 0) {
        return $scope.play(0);
      }
    });
  };
  $scope.playNext = function() {
    var nextIndex;
    nextIndex = $scope.posts[$scope.currentIndex + 1] !== void 0 ? $scope.currentIndex + 1 : -1;
    if (nextIndex > -1) {
      return $scope.applyAndPlay(nextIndex);
    }
  };
  return $window.onYouTubePlayerAPIReady = function() {
    return $window.player = new YT.Player('Player', {
      height: '390',
      width: '100%',
      events: {
        'onReady': function(event) {
          return $scope.getPosts();
        },
        'onError': function(event) {
          return $scope.playNext();
        },
        'onStateChange': function(event) {
          var nextIndex;
          if (event.target.getPlayerState() === 0) {
            nextIndex = $scope.posts[$scope.currentIndex + 1] !== void 0 ? $scope.currentIndex + 1 : -1;
            return $scope.playNext();
          }
        }
      },
      title: 'video'
    });
  };
});

shareApp.controller('Search', function($scope, $routeParams, $location, postService, pageFactory) {
  $scope.data = postService.data;
  pageFactory.resetTitle();
  if ($routeParams.searchString != null) {
    postService.clear();
    $scope.loadMore = function() {
      return postService.getPosts('search=' + $routeParams.searchString);
    };
  }
  return $scope.search = function() {
    return $location.path('/search/' + $scope.searchString);
  };
});
