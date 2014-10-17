<section class="Playlist row">
	
	<% if NoLikes %>
	
		<div class="columns large-12">
			<h1><%t Title.playlist "your playlist" %></h1>
			<h2><%t Title.NoLikes "Your playlist is still empty" %></h2>
			<p><%t Text.NoLikes "Click on like in posts with a Youtube video to add songs to your playlist." %></p>
		</div>
	
	<% else %>
	
		<section class="columns large-9 medium-9">
			<h1><%t Title.playlist "your playlist" %> {{ currentVideo }}</h1>
			
			<%-- the iframe (and video player) will replace this div tag --%>
			<div id="Player"></div>
			
			<div class="post-info">
				
			</div>
		</section>
		
		<aside class="columns large-3 medium-3 video-list">
			<h3>Videos</h3>
			<ul ng-repeat="post in posts">
				<li data-yt-playto="myPlayer" data-yt-vid="{{ post.YouTubeID }}" data-postId="{{ post.ID }}">
					<span>{{ post.Title }}</span>
				</li>
			</ul>
		</aside>
		
	</section>
	<!--
	<script>
		// this code loads the IFrame Player API code asynchronously.
		var tag = document.createElement('script');
		tag.src = "//www.youtube.com/iframe_api";
		var firstScriptTag = document.getElementsByTagName('script')[0];
		firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
		
		// this function creates an <iframe> (and YouTube player) after the API code downloads.
		var player;
		function onYouTubeIframeAPIReady() {
			var link = jQuery('.video-list a')[0];
			var id = jQuery(link).attr('data-youtubeId');
			
			playVideo(id);
		}
		
		function playVideo(id) {
			if (window.location.hash) {
				// id = window.location.hash.substr(1);
			}
			//YouTubePlayer.youtubeId = id;
			
			player = new YT.Player('Player', {
				height: '390',
				width: '100%',
				videoId: id,
				events: {
					'onReady': onPlayerReady,
					'onStateChange': onPlayerStateChange
				}
			});
		}
	
		// the API will call this function when the video player is ready.
		function onPlayerReady(event) {
			event.target.playVideo();
		}
	
		// the API calls this function when the player's state changes.
		function onPlayerStateChange(event) {
			// play next when the video has ended
			if (player.getPlayerState() === 0) {
				// YouTubePlayer.next();
			}
		}
		
		// init Playlist functions
		$(document).ready(function () {
			YouTubePlayer.init();
		});
	</script>
	-->
<% end_if %>