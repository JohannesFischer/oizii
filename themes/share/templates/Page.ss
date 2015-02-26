<!doctype html>
<html lang="en-US" ng-app="shareApp">
<head>
  <meta charset="UTF-8">
  <title>oizii</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1, user-scalable=0">
  <meta name="robots" content="index, follow">
  <link rel="icon" type="image/png" href="/themes/share/images/share-logo.png">
  <link rel="apple-touch-icon" href="/themes/share/images/share-logo-129.png">
</head>
<body>
  <header>
    <div class="row">
      <div class="column large-3 medium-3">
        <h1><a href="/#/posts" title="oizii desu yo!">oizii</a></h1>
      </div>
      <div class="column large-6 medium-6 hide-on-mobile search-form">
        <form ng-submit="search()" ng-controller="Search">
          <input type="search" name="search" class="large-12" placeholder="search for title" ng-model="searchString">
        </form>
      </div>
      <div class="column large-3 medium-3 hide-on-mobile">
        <div class="menue">
          <% if CurrentMember %>
            <a href="#" class="user-menue">$CurrentMember.FirstName</a>
          <% else %>
            <a href="/#/login" class="sign-in"><%t Menu.SignIn "sign in" %></a>
          <% end_if %>
        </div>
      </div>

    <%-- menue for mobile view --%>
    <% if CurrentMember %>
      <a href="#" class="mobile-menue mobile-only">menu</a>
    <% else %>
      <a href="/#/login" class="mobile-only sign-in"><%t Menu.SignIn "sign in" %></a>
    <% end_if %>

    </div>

    <div class="dropdown-holder hidden row">
      <div class="columns large-offset-9 large-3 medium-6 medium-offset-6">
        <ul class="dropdown">
          <% if CurrentMember %>
            <li>
              <a href="/#/add"><%t Title.newpost "add a post" %></a>
            </li>
            <li>
              <a href="/#/likes/"><%t Title.likes "your likes" %></a>
            </li>
          <% end_if %>
          <li>
            <a href="/#/about"><%t Menu.About "about share" %></a>
          </li>
          <% if CurrentMember %>
            <li>
              <a href="/Security/logout?BackURL=/"><%t Menu.SignOut "sign out" %></a>
            </li>
          <% end_if %>
        </ul>
      </div>
    </div>
  </header>

  <section ng-view></section>
	
</body>
</html>