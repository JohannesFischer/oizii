<div class="row" ng-show="showIntro">
	<div class="columns large-12">
		<div class="panel callout radius">
			<h2>oizii - share delicous music</h2>
		</div>
	</div>
</div>

<div class="row">
	<div class="columns large-12">
		<h3>{{ PageTitle }}</h3>
	</div>
</div>

<section id="Posts" class="row post-list" infinite-scroll="loadMore()" infinite-scroll-disabled="infiniteBusy">
	
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