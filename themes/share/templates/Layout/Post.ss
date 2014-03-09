<% include Loading %>

<section class="post" ng-swipe-left="nextPost()" ng-hide="loading">
	
	<section class="columns large-9 medium-9">
		
		<h1>{{ post.Title }}</h1>
		
		<p>
			<a href="/#/genre/{{ post.Genre.ID }}">{{ post.Genre.Title }}</a> &ndash;
			<%t Content.PostedOn "posted on" %> {{ post.Created }} <%t Content.By "by" %> <a href="/#/user/{{ post.User.ID }}">{{ post.User.Name }}</a>
		</p>
		
		<section class="post-content" ng-bind-html="post.Content"></section>

		<div class="flex-video player widescreen" ng-class="{vimeo: post.VimeoID != null}">
			<iframe width="560" height="315" src="{{ frameURL }}" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>
		</div>

		<p>{{ post.Likes }} Likes</p>		
		
		<a href="<% if not CurrentMember %>/#/login<% end_if %>" class="button like"<% if CurrentMember %> ng-click="sendLike()"<% end_if %> ng-hide="post.HasLiked">Like</a>
		
		<a href="<% if not CurrentMember %>/#/login<% end_if %>" class="button like"<% if CurrentMember %> ng-click="sendLike()"<% end_if %> ng-show="post.HasLiked">Unlike</a>
		
		<% if CurrentMember %>
			<a href="/#/edit/{{ post.ID }}" class="button" ng-show="post.CanEdit">Edit</a>
		<% end_if %>
		
		<div id="Comments" class="row">
		
			<div class="columns large-12">
				<h3><%t Title.Comments "Comments" %></h3>
			</div>
			
			<div class="columns large-12 no-comments" ng-hide="post.Comments.length > 0">
				<p><%t Content.nocomments "Nobody commented on this post yet" %></p>
			</div>
			
			<div class="comments">
				<div class="columns large-12" ng-repeat="comment in post.Comments">
					<img ng-src="http://www.gravatar.com/avatar/{{ comment.User.Hash }}?size=80" title="Gravatar - A Globally Recognized Avatar">
					<p><a href="/#/user/{{ comment.User.ID}}">{{ comment.User.Name }}</a> {{ comment.Created }}</p>
					<span ng-bind-html="comment.Content"></span>
					<% if hasVideoID %>
						<div class="flex-video widescreen">
							<iframe width="320" height="160" src="http://www.youtube.com/embed/$VideoID" frameborder="0" allowfullscreen></iframe>
						</div>
					<% end_if %>
				</div>
			</div>
			
			<% if CurrentMember %>
				<div class="columns large-12">
					<div class="row collapse">
						<div class="columns large-1 medium-1 hide-on-mobile gravatar" style="background-image: url($getGravatarImageForCurrentMember(80))" title="{{ post.User.Name }}"></div>
						<div class="large-9 medium-9 small-10 columns">
							<form>
								<input type="text" name="CommentText" placeholder="<%t Form.CommentPlaceholder "write a comment" %> ..." required>
							</form>
						</div>
						<div class="large-2 medium-2 small-2 columns">
							<button value="post" class="button postfix" ng-click="sendComment()" ng-disabled="commentFrombusy">submit</button>
						</div>
					</div>
				</div>
			<% end_if %>
			
		</div>
	
	</section>
	
	<aside class="columns large-3 medium-3">
		<div class="row">
			<div class="columns large-12 medium-12 small-6">
				<h4><%t Title.MoreInGenre "More posts in" %> {{ post.Genre.Title }}</h4>
				<ul ng-repeat="post in postsGenre">
					<li>
						<a href="/#/post/{{ post.ID }}">{{ post.Title }}</a>
					</li>
				</ul>
			</div>
			<div class="columns large-12 medium-12 small-6">
				<h4><%t Title.MoreFromUser "More posts of" %> {{ post.User.Name }}</h4>
				<ul ng-repeat="post in postsUser">
					<li>
						<a href="/#/post/{{ post.ID }}">{{ post.Title }}</a>
					</li>
				</ul>
			</div>
		</div>
	</aside>