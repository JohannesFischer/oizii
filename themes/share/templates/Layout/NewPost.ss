<div class="columns large-12">
	<h2><% if Edit %><%t Title.Editpost "Edit Post" %><% else %><%t Title.Newpost "Add Post" %><% end_if %></h2>
</div>	

<section class="columns large-12">
	<form id="NewPost" name="NewPost" class="custom" novalidate>	
		
		<label><%t Form.Title "Title" %></label>
		<input type="text" name="pTitle" ng-model="post.Title" required>
		
		<label><%t Form.Description "Description" %></label>
		<textarea name="Text" cols="30" rows="10" ng-model="post.Content"></textarea>
		
		<label><%t Form.Genre "Genre" %></label>
		<select name="uGenre" class="medium" ng-model="post.Genre.ID" required>
			<option value="">-- select genre --</option>
			<% loop Genres %>
				<option value="$ID">$Title</option>
			<% end_loop %>
		</select>
		
		<label><%t Form.Link "YouTube, DailyMotion, Soundcloud or Vimeo Link" %></label>
		<input type="url" name="pLink" ng-model="post.Link" required>
		
		<button class="button" ng-click="submitPost(post)" ng-disabled="NewPost.\$invalid || isUnchanged(post)"><%t Form.Submit "save" %></button>
		
	</form>
</section>