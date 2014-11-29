<div id="Main">{{ stuff }}

<div class="row" ng-show="showIntro">
	<div class="columns large-12">
		<div class="panel callout">
			<h2>oizii - share delicous music</h2>
			<span class="toggle-filters" ng-click="toggleFilters()" ng-class="{open: hideFilters == false}">Filters</span>
			<div class="filters" ng-hide="hideFilters">
				<p>
					<strong>Genre</strong>
				</p>
				<% loop Genres %>
					<a href="/#/genre/$ID" class="button round small">$Title</a>
				<% end_loop %>
				<p>
					<strong>User</strong>
				</p>
				<% loop Users %>
					<a href="/#/user/$ID" class="button round small">$FirstName</a>
				<% end_loop %>
			</div>
		</div>
	</div>
</div>

<div class="row" ng-hide="!pageTitle">
	<div class="columns large-12 text-center">
		<div class="page-title">
			<h3>{{ pageTitle }}</h3>
		</div>
	</div>
</div>

<div class="row" ng-show="showPlaytag">
	<div class="columns medium-offset-4 medium-4 text-center playlist-link">
		<a href="/#/playlist/tag/{{ tag }}">play all songs in playlist</a>
	</div>
</div>

<section id="Posts" class="row post-list" infinite-scroll="loadMore()" infinite-scroll-disabled="data.infiniteBusy">
  
  <p ng-show="data.posts.length == 0 && !data.loading">no results</p>
	
  <% include Error %>
  
	<article class="columns large-4 medium-6 tile" ng-repeat="post in data.posts">
		<div class="content reveal-animation" style="background-color:#{{ post.User.HEX }}">
			<div class="margin">
				<h2>
					<a href="/#/post/{{ post.ID }}">{{post.Title}}</a>
				</h2>
				<p class="date toggle">{{ post.Created | date:'yy-MM-dd' }}</p>
				<p class="genre">
					<a href="/#/genre/{{ post.Genre.ID }}">{{post.Genre.Title}}</a>
				</p>
				<p class="author">
					<a href="/#/user/{{ post.User.ID }}" title="posts von {{ post.User.Name }}">{{ post.User.Name }}</a>
				</p>
			</div>
		</div>
	</article>
	
	<div class="clear"></div>
	
	<% include Loading %>

</section>
</div>