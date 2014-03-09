$(document).ready(function  () {
	
	if (jQuery('.search-form form')[0]) {
		jQuery('.search-form form').submit(function () {
			var value = jQuery('input[type=search]',this).val();
			if (value !== '') {
				window.location.href = searchForm.attr('action') + value;
			}
			return false;
		});
		
		// init autocomplete
		AutoComplete.init(jQuery('div.search-form input[type=search]'), jQuery('div.autocomplete-holder'));
	}
	
	// target blank
	jQuery('a.new-window,a[rel=external]').each(function () {
		$(this).click(function () {
			window.open($(this).attr('href'));
			return false;
		});
	});
	
	// like / unlike
	jQuery('a.xhr').each(function () {
		$(this).click(function () {
			var a = $(this);
			if ($(this).hasClass('disabled')) return false;
			
			$(this).addClass('disabled');
			
			$.ajax({
				url: $(this).attr('href')
			}).done(function () {
				if (a.hasClass('like')) {
					if (a.text() == 'Like') {
						a.html('Unlike');
					} else {
						a.html('Like');
					}
				}
				a.removeClass('disabled');
			});
			
			return false;
		});
	});
	
	// links in post content
	jQuery('.post-content a').each(function () {
		jQuery(this).click(function () {
			window.open($(this).attr('href'));
			return false;
		});
	});

	// new comment
	if (jQuery('#Comments')) {
		jQuery('#Comments form').submit(function () {
			jQuery.ajax({
				data: $(this).serialize(),
				dataType: 'json',
				success: function (data) {
					if (data.Comment) {
						
						if (jQuery('.no-comments')) jQuery('.no-comments').detach();
						
						jQuery('#Comments form input[type=text]').val('');
						
						var div = jQuery('<div/>').addClass('columns twelve');
						
						jQuery('<img/>', {
							src: data.Comment.Image
						}).appendTo(div);
						
						var p = jQuery('<p/>').appendTo(div);
						jQuery('<a/>', {
							href: '/share/user/' + data.Comment.Member,
							text: data.Comment.Member
						}).appendTo(p);
						jQuery('<span/>', {
							text: ' ' + data.Comment.Created
						}).appendTo(p);
						jQuery('<div/>', {
							html: data.Comment.Content
						}).appendTo(div);
						jQuery('.comments').append(div);
					} else {
						alert('An error occured :(');
					}
				},
				type: 'post',
				url: jQuery(this).attr('action')
			});
			
			return false;
		});
	}
	
	// new post
	if (jQuery('#NewPost')) {
		jQuery('#NewPost').submit(function () {
			jQuery('#NewPost input[type=submit]').attr('disabled', 'disabled');
			
			$.ajax({
				data: $(this).serialize(),
				dataType: 'json',
				success: function (data) {
					if (data.success) {					
						window.location = 'http://' + window.location.hostname + '/share/getpost/' + data.success.ID;
					} else {
						alert('An error occured :(');
					}
				},
				type: 'post',
				url: $(this).attr('action')
			});
			
			return false;
		});
	};
	
	// user menue
	jQuery('a.user-menue, a.mobile-menue').each(function () {
		$(this).click(function () {
			var holder = jQuery('.dropdown').closest('.row');
			
			if (holder.hasClass('hidden')) {
				userMenue.show();
			} else {
				userMenue.hide();
			}
			
			return false;
		});
	});
	
	// init foundation
	//$(document).foundation();
});

var userMenue = {
	
	holder: jQuery('.dropdown').closest('.row'),
	
	hide: function () {
		jQuery('header').removeClass('header-open-mobile');
		this.holder.addClass('hidden').css('height', 0);
	},
	
	show: function () {
		if ( ! this.holder.hasClass('hidden')) {
			return;
		}
		
		jQuery('header').addClass('header-open-mobile');
		this.holder.removeClass('hidden').css('height', 'auto');
		
		jQuery('body').click(function () {
			userMenue.hide();
			jQuery('body').unbind('click');
		});
	}
	
};