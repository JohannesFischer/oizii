$ ->
  # target blank
  jQuery('a.new-window,a[rel=external]').each(->
    $(this).on "click", ->
      window.open($(this).attr('href'))
      defaultPrevented()
  )

  # links in post content
  jQuery('.post-content a').each(->
    jQuery(this).on "click", ->
      window.open($(this).attr('href'))
      defaultPrevented()
  )

  # user menue
  jQuery('a.user-menue, a.mobile-menue').each(->
    $(this).on "click", ->
      holder = jQuery('.dropdown').closest '.row'

      if holder.hasClass('hidden')
        userMenue.show()
      else
        userMenue.hide()

      return false
  )

userMenue = {
  holder: jQuery('.dropdown').closest('.row')
  hide: ->
    jQuery('header').removeClass('header-open-mobile')
    @holder.addClass('hidden').css('height', 0)
  show: ->
    if ! this.holder.hasClass('hidden')
      return

    jQuery('header').addClass('header-open-mobile')
    @holder.removeClass('hidden').css('height', 'auto')

    jQuery('body').on "click", ->
      userMenue.hide()
      jQuery('body').unbind('click')
}