<?php

class ShareAdmin extends ModelAdmin {
  public static $managed_models = array(
    'Color',
    'Genre',
    'PageContent',
    'Comment'
  );

  static $url_segment = 'contentadmin';
  static $menu_title = 'Content Admin';
}