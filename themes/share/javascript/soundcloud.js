var embedSoundcloud = function (client_id, sc_track_url) {
  SC.initialize({
    client_id: client_id
  });

  SC.oEmbed(sc_track_url, { auto_play: false, show_comments: false }, function(oEmbed) {
    try {
      jQuery('#SoundcloudPlayer').html(oEmbed.html);
    } catch(oembed) {
      jQuery('#SoundcloudPlayer').html('<div class="alert-box alert"><p>Track not found: <a href="' + sc_track_url + '">' + sc_track_url + '</a></p></div>');
    }
  });
};