'use strict'

# Controllers

# About
shareApp.controller 'About', ($scope, $http, pageFactory) ->
  $scope.genres = []
  pageFactory.setTitle('About')

  $http
    url: 'data/getGenreStats'
  .success (data) ->
    $scope.genres = data[0].Genres

# Login
shareApp.controller 'Login', ($scope, $http, $cookies, pageFactory) ->
  $scope.error = false

  $http
    url: 'data/isLoggedIn'
  .success (data) ->
    if data.User?
      window.location.href = '/'

  pageFactory.setTitle('Login')

  $scope.login = ->
    $scope.error = false

    mail = angular.element(document.querySelector('#Email'))
    pass = angular.element(document.querySelector('#Password'))

    postData =
      email: mail.val()
      password: pass.val()

    # validation
    $http
      url: '/data/login/'
      method: "POST"
      data: postData
      headers:
        'Content-Type': 'application/json'
    .success (data) ->
      if data.User?
        url = '/'
        if $cookies.lastVisited
          url = '#' + $cookies.lastVisited
        window.location.href = url
      else
        $scope.error = true
    $route.reload()

# PostList
shareApp.controller 'PostList', ($scope, postService, pageFactory) ->
  $scope.data = postService.data
  postService.clear()

  # toggle Intro text
  $scope.showIntro = true
  $scope.hideFilters = true

  pageFactory.resetTitle()

  $scope.loadMore = ->
    postService.getPosts()

  $scope.toggleFilters = ->
    $scope.hideFilters = ! $scope.hideFilters;

# PostList by Genre
shareApp.controller 'PostListGenre', ($scope, $routeParams, postService, pageFactory) ->
  $scope.data = postService.data
  postService.clear()
  # todo set title
  pageFactory.resetTitle()

  $scope.loadMore = ->
    postService.getPosts "genreId=#{$routeParams.genreId}"

    $scope.title = postService.getValue 'posts[0].Genre.Title'

# PostList by Tag
shareApp.controller 'PostListTag', ($scope, $routeParams, postService, pageFactory) ->
  $scope.data = postService.data
  $scope.showPlaytag = true
  $scope.tag = $routeParams.tag
  postService.clear()
  $scope.pageTitle = '#' + $routeParams.tag
  pageFactory.setTitle 'tag #' + $routeParams.tag

  $scope.loadMore = ->
    postService.getPosts("tag=#{$routeParams.tag}")


# PostList by User
shareApp.controller 'PostListUser', ($scope, $routeParams, postService, pageFactory) ->
  $scope.data = postService.data
  postService.clear()
  # todo set title
  pageFactory.resetTitle()

  $scope.loadMore = ->
    postService.getPosts('userId=' + $routeParams.userId)

# PostList User Likes
shareApp.controller 'PostListLikes', ($scope, postService, pageFactory) ->
  $scope.data = postService.data
  postService.clear()
  $scope.pageTitle = 'Your Likes'
  pageFactory.setTitle 'Your Likes'

  $scope.loadMore = ->
    postService.getPosts 'likes=1'

# Post Add
shareApp.controller 'NewPost', ($scope, postFactory) ->
  $scope.loading = false
  $scope.post = {}

  $scope.submitPost = (post) ->
    postFactory.submitPost(post)

  # checking for pasted Bandcamp iframe source end extracts src
  $scope.cleanBCLink = ->
    bcLink = postFactory.cleanBCLink($scope.post.Link)

    if bcLink isnt false
        $scope.post.Link = bcLink

  $scope.isUnchanged = (post) ->
    false

# Post Edit
shareApp.controller 'PostEdit', ($scope, $http, $location, $routeParams, postFactory) ->
  $scope.edit = true
  $scope.loading = true
  $scope.master = {}
  $scope.post = {}

  $http
    url: "data/getPost/#{$routeParams.postId}?edit=1"
  .success (data) ->
    $scope.loading = false
    if data.CanEdit isnt true
      $location.path('/')

    $scope.post = data
    $scope.master = angular.copy($scope.post)

  # checking for changes on scope
  $scope.isUnchanged = (post) ->
    return angular.equals(post, $scope.master)

  # cancel editing and return to post
  $scope.cancelEdit = (post) ->
    if $scope.isUnchanged(post) is false
      if confirm 'Do you want to discard your changes?'
        $location.path('/post/' + post.ID)
    else
      $location.path('/post/' + post.ID)

  # checking for pasted Bandcamp iframe source end extracts src
  $scope.cleanBCLink = ->
    bcLink = postFactory.cleanBCLink($scope.post.Link)
    if bcLink isnt false
      $scope.post.Link = bcLink

  # submit changed post
  $scope.submitPost = (post) ->
    postFactory.submitPost(post)

# Post Details
shareApp.controller 'PostDetails', (soundcloudClientId, $scope, $routeParams, $http, $sce, postFactory, pageFactory) ->
  $scope.likeUsers = null
  $scope.loading = true
  $scope.commentFrombusy = false
  # todo test if that stuff works
  window.scrollTo 0, 0

  $http
    url: 'data/getPost/' + $routeParams.postId
  .success (data) ->
    $scope.loading = false
    $scope.post = data
    $scope.post.Content = $sce.trustAsHtml(data.Content)
    pageFactory.setTitle(data.Title)

    for i in [0...$scope.post.Comments.length] by 1
      content = $sce.trustAsHtml($scope.post.Comments[i].Content)
      $scope.post.Comments[i].Content = content

    # init Player
    if data.YouTubeID isnt null
      # YouTube
      $scope.frameURL = $sce.trustAsResourceUrl('http://www.youtube.com/embed/' + data.YouTubeID)
    else if data.DailyMotionID isnt null
      # Daily Motion
      $scope.frameURL = $sce.trustAsResourceUrl('http://www.dailymotion.com/embed/video/' + data.DailyMotionID)
    else if data.VimeoID isnt null
      # Vimeo
      $scope.frameURL = $sce.trustAsResourceUrl('http://player.vimeo.com/video/' + data.VimeoID)
    else if data.Link isnt null && data.Link.indexOf('soundcloud') > -1
      # SoundCloud
      e = angular.element(document.querySelector('iframe'))
      e.replaceWith('<div id="SoundcloudPlayer"/>')
      embedSoundcloud(soundcloudClientId, data.Link)
    else if data.BandcampAlbumID isnt null
      # Bandcamp
      $scope.frameURL = $sce.trustAsResourceUrl('http://bandcamp.com/EmbeddedPlayer/album=' + data.BandcampAlbumID + '/size=large/bgcol=333333/linkcol=0f91ff/transparent=true/t=' + data.BandcampTrack)
    else if data.EightTracksID isnt null
      # 8Tracks
      $scope.frameURL = $sce.trustAsResourceUrl('http://8tracks.com/mixes/' + data.EightTracksID + '/player_v3_universal')
    else
      # shows error message / hides player
      $scope.loadingError = true

    # Posts by GenreID
    genreUrl = "?limit=5&random=1&genreId=#{$scope.post.Genre.ID}&exclude=#{$scope.post.ID}"
    postFactory.getPosts(genreUrl).then((response) ->
        $scope.postsGenre = response
      , (errorPayload) ->
        $log.error 'failed loading posts', errorPayload
    )

    # Posts by UserID
    userUrl = "?limit=5&random=1&userId=#{$scope.post.User.ID}&exclude=#{$scope.post.ID}"
    postFactory.getPosts(userUrl).then((response) ->
        $scope.postsUser = response
      , (errorPayload) ->
        $log.error 'failure loading movie', errorPayload
    )

    # set last visited page
    pageFactory.setLastVisited($routeParams.postId)

    # controller functions
    $scope.getLikes = ->
      if $scope.likeUsers is null && $scope.post.Likes > 0
        $http
          url: 'data/getLikes/' + $scope.post.ID
        .success (data) ->
          usr = []
          for i in [0...data.length] by 1
            usr.push(data[i].User.Name)
          $scope.likeUsers = usr.join(', ')

    $scope.sendComment = ->
      $scope.commentFrombusy = true;
      commentField = angular.element(document.querySelector('input[name=CommentText]'))

      data =
        ID: $scope.post.ID
        Text: commentField[0].value.trim()

      if data.Text is ''
        return

      $http
          url: '/data/comment/'
          method: "POST"
          data: data
          headers:
            'Content-Type': 'application/json'
      .success (data) ->
        $scope.post.Comments = data;

        for i in [0...data.length] by 1
          $scope.post.Comments[i].Content = $sce.trustAsHtml(data[i].Content)

        $scope.commentFrombusy = false
        commentField[0].value = ''


    $scope.sendLike = ->
      $http
        url: 'data/like/?postId=' + $scope.post.ID
      .success (data) ->
        # check if like count is in or decreased
        $scope.post.HasLiked = data.Likes > $scope.post.Likes

        $scope.post.Likes = data.Likes

    # touch / swipe functions
    $scope.nextPost = ->
      # do stuff

# Playlist
shareApp.controller 'Playlist', ($scope, $http, $routeParams, $document, $window, postFactory, pageFactory) ->
  tag = $document[0].createElement('script')
  tag.src = "https://www.youtube.com/iframe_api"
  firstScriptTag = $document[0].getElementsByTagName( 'script' )[0]
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

  $scope.currentIndex = -1
  $scope.loading = true
  $scope.post = {}
  $scope.posts = []
  $scope.tag = $routeParams.tag
  pageFactory.setTitle('#' + $routeParams.tag + ' playlist')

  # play
  $scope.play = (index) ->
    $scope.post = $scope.posts[index]
    $scope.currentIndex = index;
    $window.player.loadVideoById($scope.posts[index].YouTubeID)

  # play call from Player
  $scope.applyAndPlay = (index) ->
    $scope.$apply(->
      $scope.post = $scope.posts[index]
      $scope.currentIndex = index
    )
    $scope.play(index)

  # get posts
  $scope.getPosts = ->
    postFactory.getPosts('?tag=' + $routeParams.tag + '&youtube=1').then (data) ->
      $scope.loading = false
      for i in [0...data.length] by 1
        $scope.posts.push(data[i])
      if data.length > 0
        $scope.play(0)

  # play next player event
  $scope.playNext = ->
    nextIndex = if $scope.posts[($scope.currentIndex + 1)] isnt undefined then $scope.currentIndex + 1 else -1
    if nextIndex > -1
      $scope.applyAndPlay(nextIndex)

  # load Youtube Player
  $window.onYouTubePlayerAPIReady = ->
    $window.player = new YT.Player('Player', {
      height: '390'
      width: '100%',
      #videoId: $scope.posts[$scope.currentIndex].YouTubeID,
      events: {
        'onReady': (event) ->
            $scope.getPosts()
        'onError': (event) ->
          $scope.playNext()
        'onStateChange': (event) ->
          # when finished
          if event.target.getPlayerState() is 0
            nextIndex = if $scope.posts[($scope.currentIndex + 1)] isnt undefined then $scope.currentIndex + 1 else -1
            $scope.playNext()
      },
      title: 'video'
    })

# Search
shareApp.controller 'Search', ($scope, $routeParams, $location, postService, pageFactory) ->
  $scope.data = postService.data
  # todo set title
  pageFactory.resetTitle()

  if $routeParams.searchString?
    postService.clear()
    $scope.loadMore = ->
      postService.getPosts 'search=' + $routeParams.searchString

  $scope.search = ->
    $location.path('/search/' + $scope.searchString)