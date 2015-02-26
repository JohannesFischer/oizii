var userMenue;

$(function() {
  jQuery('a.new-window,a[rel=external]').each(function() {
    return $(this).on("click", function() {
      window.open($(this).attr('href'));
      return defaultPrevented();
    });
  });
  jQuery('.post-content a').each(function() {
    return jQuery(this).on("click", function() {
      window.open($(this).attr('href'));
      return defaultPrevented();
    });
  });
  return jQuery('a.user-menue, a.mobile-menue').each(function() {
    return $(this).on("click", function() {
      var holder;
      holder = jQuery('.dropdown').closest('.row');
      if (holder.hasClass('hidden')) {
        userMenue.show();
      } else {
        userMenue.hide();
      }
      return false;
    });
  });
});

userMenue = {
  holder: jQuery('.dropdown').closest('.row'),
  hide: function() {
    jQuery('header').removeClass('header-open-mobile');
    return this.holder.addClass('hidden').css('height', 0);
  },
  show: function() {
    if (!this.holder.hasClass('hidden')) {
      return;
    }
    jQuery('header').addClass('header-open-mobile');
    this.holder.removeClass('hidden').css('height', 'auto');
    return jQuery('body').on("click", function() {
      userMenue.hide();
      return jQuery('body').unbind('click');
    });
  }
};
