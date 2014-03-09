<section id="Posts" class="post-list" infinite-scroll="loadMore()" infinite-scroll-disabled="infiniteBusy">
	
	<article class="columns large-4 medium-6 tile" ng-repeat="post in posts">
		<div class="content" style="background-color:#{{ post.User.HEX }}">
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