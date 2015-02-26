<?php

class PostAdmin extends ModelAdmin {
  public static $managed_models = array(
    'Post'
  );

  static $url_segment = 'postadmin';
  static $menu_title = 'Post Admin';
}