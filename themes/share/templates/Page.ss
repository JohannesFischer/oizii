<!doctype html>
<html lang="en-US" ng-app="shareApp">
<head>
	<meta charset="UTF-8">
	<title><% if getTitle %>$getTitle :: <% end_if %>oizii</title>
	<meta name="viewport" content="width=device-width">
	<meta name="robots" content="index, follow">
	<link rel="icon" type="image/png" href="/themes/share/images/share-logo.png">
	<link rel="apple-touch-icon" href="/themes/share/images/share-logo-129.png">
</head>
<body>
	
	<header>
		
	    <div class="row">
	        <div class="column large-3 medium-3">
	            <h1><a href="/" title="oizii desu yo!">oizii</a></h1>
	        </div>
	        <div class="column large-6 medium-6 hide-on-mobile search-form">
	            <form action="{$BaseURL}share/search/">
	                <input type="search" name="search" class="large-12" placeholder="search for title or genre"<% if SearchTerm %> value="$SearchTerm"<% end_if %>>
                </form>
				<div class="autocomplete-holder large-12"></div>
	        </div>
	        <div class="column large-3 medium-3 hide-on-mobile">
				<div class="menue">
					<% if CurrentMember %>
						<a href="#" class="user-menue">$CurrentMember.FirstName</a>
						<!--
						<a href="#" class="notification-count" title="Hier kommen die Benachrichtungen">(3)</a>
						-->
					<% else %>
						<a href="/#/login" class="sign-in"><%t Menu.SignIn "sign in" %></a>
					<% end_if %>
				</div>
	        </div>
			
			<!-- menue for mobile view -->
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
						<li>
							<a href="/user/playlist"><%t Title.playlist "your playlist" %></a>
						</li>
					<% end_if %>
					<li>
						<a href="/#/about"><%t Menu.About "about share" %></a>
					</li>
					<li>
						<% if CurrentMember %>
							<a href="/Security/logout?BackURL=/{$CurrentURL}"><%t Menu.SignOut "sign out" %></a>
						<% else %>
							<a href="/Security/login?BackURL=/{$CurrentURL}" class="sign-in"><%t Menu.SignIn "sign in" %></a>
						<% end_if %>
					</li>
				</ul>
			</div>
		</div>
		
	</header>
	
	$Layout
	
</body>
</html>