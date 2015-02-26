window.shareApp = angular.module 'shareApp', [
  'ngAnimate',
  'ngCookies',
  'ngRoute',
  'ngTouch',
  'infinite-scroll'
]

shareApp.value 'postsPerPage', '18'
shareApp.value 'soundcloudClientId', 'a12345654321x'

shareApp.config(['$routeProvider', ($routeProvider) ->
  $routeProvider.when('/about',
    templateUrl: 'layout/about/'
    controller: 'About'
  ).when('/add',
    templateUrl: 'layout/newpost/'
    controller: 'NewPost'
  ).when('/edit/:postId',
    templateUrl: 'layout/newpost/'
    controller: 'PostEdit'
  ).when('/genre/:genreId',
    templateUrl: 'layout/posts/'
    controller: 'PostListGenre'
  ).when('/likes/',
    templateUrl: 'layout/posts/'
    controller: 'PostListLikes'
  ).when('/login',
    templateUrl: 'layout/login/'
    controller: 'Login'
  ).when('/playlist/tag/:tag',
    templateUrl: 'layout/playlist/'
    controller: 'Playlist'
  ).when('/post/:postId',
    templateUrl: 'layout/post/'
    controller: 'PostDetails'
  ).when('/posts',
    templateUrl: 'layout/posts/'
    controller: 'PostList'
  ).when('/search/:searchString',
    templateUrl: 'layout/search/'
    controller: 'Search'
  ).when('/share',
    templateUrl: 'layout/newpost/'
    controller: 'NewPost'
  ).when('/tag/:tag',
    templateUrl: 'layout/posts/'
    controller: 'PostListTag'
  ).when('/user/:userId',
    templateUrl: 'layout/posts/'
    controller: 'PostListUser'
  ).otherwise(
    redirectTo: 'posts/'
  )
])