$(document).ready(function  () {	
	// target blank
	jQuery('a.new-window,a[rel=external]').each(function () {
		$(this).click(function () {
			window.open($(this).attr('href'));
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