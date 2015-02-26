'use strict'

# Factories
shareApp.factory 'pageFactory', ($http, $cookies, $location) ->
  defaultTitle = 'oizii :: share delicous music'
  {
    resetTitle: ->
      document.title = defaultTitle
    setLastVisited: (postId) ->
      $cookies.lastVisited = $location.url()
    setTitle: (newTitle) ->
      document.title = "#{newTitle} :: #{defaultTitle}"
  }

lilyAdmin.factory 'chartFactory', ($http, $location, $q, $log) ->
  cleanBCLink: (link) ->
    bc = (link).indexOf('bandcamp.com/EmbeddedPlayer/') > -1
    et = (link).indexOf('8tracks.com/') > -1
    if link isnt undefined && (bc || et)
      regex = /<iframe.*?src="(.*?)"/
      match = regex.exec(link)
      if match[1]
        return match[1]
      return false
    return false
    getPost: (id) ->
      $http
        url: 'data/getPost/' + id
      .success (data) ->
        return data
    getPosts: (parameter) ->
      deferred = $q.defer()
      $http
        url: "data/getPosts#{parameter}"
      .success (data) ->
        deferred.resolve(data)
      .error (msg, code) ->
        deferred.reject(msg)
        $log.error msg, code
      deferred.promise
    submitPost: (formData) ->
      $http
        url: '/data/newPost/'
        method: "POST"
        data: formData
        headers:
          'Content-Type': 'application/json'
      .success (data) ->
        if data.ID isnt undefined
          $scope.error = true
        else
          $location.path('/post/' + data.ID)

# Provider

shareApp.provider 'postService', ->
  data =
    error: false
    infiniteBusy: false
    loading: false
    posts: []
    title: null
    start: 0

  @.$get = (postFactory, postsPerPage, $log) ->
    data: data,
    add: (item) ->
      data.posts.push(item)
    getPosts: (parameter) ->
      # disable infinte-scroll
      data.infiniteBusy = true
      data.loading = true
      # add URL params
      parameter = if parameter is undefined then '?' else "? #{parameter} &"
      parameter += 'limit=' + postsPerPage
      parameter += if data.start > 0 then "&start=#{data.start}" else ''

      postFactory.getPosts(parameter).then((response) ->
        if response.length > 0
          for i in [0...response.length] by 1
            data.posts.push(response[i])
          # if less posts returned than perPage
          if response.length != postsPerPage
            data.loading = false
          else
            data.start += response.length
            data.infiniteBusy = false
        else
          data.loading = false
      , (errorPayload) ->
        data.error = true
        $log.error 'failed loading movie', errorPayload
      )
    getValue: (obj) ->
      data['posts']
    clear: ->
      data.posts = []
      data.start = 0
      data.infiniteBusy = false
      data.loading = false
    setTitle: (title) ->
      data.title = title
  undefined