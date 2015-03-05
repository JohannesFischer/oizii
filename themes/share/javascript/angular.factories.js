'use strict';
shareApp.factory('pageFactory', function($http, $cookies, $location) {
  var defaultTitle;
  defaultTitle = 'oizii :: share delicous music';
  return {
    resetTitle: function() {
      return document.title = defaultTitle;
    },
    setLastVisited: function(postId) {
      return $cookies.lastVisited = $location.url();
    },
    setTitle: function(newTitle) {
      return document.title = "" + newTitle + " :: " + defaultTitle;
    }
  };
});

shareApp.factory('postFactory', function($http, $location, $q, $log) {
  return {
    cleanBCLink: function(link) {
      var bc, et, match, regex;
      bc = link.indexOf('bandcamp.com/EmbeddedPlayer/') > -1;
      et = link.indexOf('8tracks.com/') > -1;
      if (link !== void 0 && (bc || et)) {
        regex = /<iframe.*?src="(.*?)"/;
        match = regex.exec(link);
        if (match[1]) {
          return match[1];
        }
        return false;
      }
      return false;
    },
    getPost: function(id) {
      return $http({
        url: 'data/getPost/' + id
      }).success(function(data) {
        return data;
      });
    },
    getPosts: function(parameter) {
      var deferred;
      deferred = $q.defer();
      $http({
        url: "data/getPosts" + parameter
      }).success(function(data) {
        return deferred.resolve(data);
      }).error(function(msg, code) {
        deferred.reject(msg);
        return $log.error(msg, code);
      });
      return deferred.promise;
    },
    submitPost: function(formData) {
      return $http({
        url: '/data/newPost/',
        method: "POST",
        data: formData,
        headers: {
          'Content-Type': 'application/json'
        }
      }).success(function(data) {
        if (data.ID != null) {
          return $location.path('/post/' + data.ID);
        } else {
          return $log.error(data);
        }
      }).error(function(msg, code) {
        return $log.error(msg, code);
      });
    }
  };
});

shareApp.provider('postService', function() {
  var data;
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
      add: function(item) {
        return data.posts.push(item);
      },
      getPosts: function(parameter) {
        data.infiniteBusy = true;
        data.loading = true;
        parameter = parameter === void 0 ? '?' : "? " + parameter + " &";
        parameter += 'limit=' + postsPerPage;
        parameter += data.start > 0 ? "&start=" + data.start : '';
        return postFactory.getPosts(parameter).then(function(response) {
          var i, _i, _ref;
          if (response.length > 0) {
            for (i = _i = 0, _ref = response.length; _i < _ref; i = _i += 1) {
              data.posts.push(response[i]);
            }
            if (response.length < postsPerPage) {
              return data.loading = false;
            } else {
              data.start += response.length;
              return data.infiniteBusy = false;
            }
          } else {
            return data.loading = false;
          }
        }, function(errorPayload) {
          data.error = true;
          return $log.error('failed loading movie', errorPayload);
        });
      },
      getValue: function(obj) {
        return data['posts'];
      },
      clear: function() {
        data.posts = [];
        data.start = 0;
        data.infiniteBusy = false;
        return data.loading = false;
      },
      setTitle: function(title) {
        return data.title = title;
      }
    };
  };
  return void 0;
});
