var YouTubePlayer = {

	current: 0,
	links: null,
	// youtubeId: null,
	
	init: function (videoID) {
		this.links = jQuery('.video-list a');
		
		if (window.location.hash) {
			var id = window.location.hash.substr(1);
			
			this.links.each(function (i) {
				if ($(this).attr('data-youtubeId') === id) {
					YouTubePlayer.current = i;
				}
			});
		}
		
		this.highlightCurrent();
		this.attach();
	},
	
	attach: function () {
		this.links.each(function (i, el) {
			$(this).click(function () {
				var youtubeId = $(this).attr('data-youtubeId');
				player.loadVideoById(youtubeId, 0, 'large');
				YouTubePlayer.current = i;
				YouTubePlayer.highlightCurrent();
			});
		});
	},
	
	getInfo: function () {
		var id = jQuery(this.links[this.current]).attr('data-postId');
		var target = jQuery('.post-info');
		target.html('');
		
		$.ajax({
			dataType: 'json',
			success: function (data) {
				if (data) {					
					jQuery('<h2/>', {
						html: data.Title
					}).appendTo(target);
					
					var p = jQuery('<p/>').appendTo(target);
					
					jQuery('<a/>', {
						html: data.Member,
						href: '/share/user/' + data.Member
					}).appendTo(p);
					
					jQuery('<span/>', {
						html: ' / ' + data.Created
					}).appendTo(p);
					
					if (data.Genre !== '') {
						jQuery('<span/>', {
							html: ' / '
						}).appendTo(p);
						
						jQuery('<a/>', {
							html: data.Genre,
							href: '/share/byGenre/' + data.GenreID
						}).appendTo(p);
					}
					
					if (data.Text !== '') {
						jQuery('<p/>', {
							html: data.Text
						}).appendTo(p);
					}					
				} else {
					alert('An error occured :(');
				}
			},
			type: 'get',
			url: '/share/getPostInfo/' + id
		});
	},
	
	highlightCurrent: function () {
		if (jQuery('.video-list a.current')) {
			jQuery('.video-list a.current').removeClass('current');
		}
		
		jQuery(this.links[this.current]).addClass('current');
		
		YouTubePlayer.getInfo();
	},
	
	next: function () {
		this.current = this.current + 1 < this.links.length ? this.current + 1 : 0;
		var nextVideo = jQuery(this.links[this.current]);
		var videoID = nextVideo.attr('data-youtubeId');
		
		window.location.hash = videoID;
		
		player.loadVideoById(videoID, 0, 'large');
		
		YouTubePlayer.highlightCurrent();
	},
	
	play: function (videoID) {
		
	}
	
};