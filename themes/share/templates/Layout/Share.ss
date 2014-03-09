<% if LikesPage || SearchTerm || UserName || Genre %>
	<section class="row">
		<div class="columns large-12">
			<% if UserName %>
				<h1><%t Title.usershares "All shares from  {username}" username=$UserName %></h1>
			<% else_if SearchTerm %>
				<h1><%t Title.results "{resultcount} results for {searchterm}" resultcount=$Posts.Count searchterm=$SearchTerm %></h1>
			<% else_if LikesPage %>
				<h1><%t Title.yourlikes "Your Likes" %></h1>
			<% else_if Genre %>
				<h1><%t Title.genre "All posts in {genre}" genre=$Genre %></h1>
			<% end_if %>
		</div>		

		<% if CurrentMember && LikesPage %>
			<section class="columns large-12">
				<div class="alert-box">
					<h6>Playlist</h6>
					<p>Play your likes from youtube in a <a href="/user/playlist">playlist</a></p>
				</div>
			</section>
		<% end_if %>

	</section>
<% end_if %>

<section class="row" ng-view></section>
<%--
<% if Posts.MoreThanOnePage %>
	<section class="pagination-buttons row">	
		<% if Posts.NotFirstPage %>
			<section class="columns large-6">
				<a class="button" href="/$Posts.PrevLink">Prev</a>
			</section>
		<% end_if %>
		<% if Posts.NotLastPage %>
			<section class="columns large-6<% if Posts.NotFirstPage %><% else %> large-offset-6<% end_if %>">
				<a class="button right" href="/$Posts.NextLink">Next</a>
			</section>
		<% end_if %>
	</section>
<% end_if %>
--%>