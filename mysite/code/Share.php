<?php

class Share_Controller extends Controller {
  private $theme_folder;

  private  static $allowed_actions = array (
    'getPostInfo',
    'edit',
    'player',
    'savepost',
    'user'
  );

  public function init() {
    parent::init();

    $this->theme_folder = 'themes/' . SSViewer::current_theme() . '/'; // $this->ThemeDir()

    Requirements::set_combined_files_folder($this->theme_folder . '_combinedfiles');

    // include CSS
    $css_folder = $this->theme_folder . 'css/';

    $css_array = array(
      $this->theme_folder . 'bower/foundation/css/normalize.css',
      $this->theme_folder . 'bower/foundation/css/foundation.css',
      $css_folder . 'app.css'
    );

    // combine CSS
    Requirements::combine_files('css_min.css', $css_array);

    // include JS
    $js_folder = $this->theme_folder . 'javascript/';

    $js_array = array(
      $this->theme_folder . 'bower/jquery/dist/jquery.min.js',
      $this->theme_folder . 'bower/angular/angular.min.js',
      $this->theme_folder . 'bower/angular-route/angular-route.min.js',
      $this->theme_folder . 'bower/angular-touch/angular-touch.min.js',
      $this->theme_folder . 'bower/angular-cookies/angular-cookies.min.js',
      $this->theme_folder . 'bower/angular-animate/angular-animate.min.js',
      $this->theme_folder . 'bower/ng-infinite-scroller-origin/build/ng-infinite-scroll.min.js',
      $this->theme_folder . 'bower/foundation/js/foundation.min.js',
      $js_folder . 'angular.app.js',
      $js_folder . 'angular.factories.js',
      $js_folder . 'angular.controller.js',
      $js_folder . 'init.js',
      $js_folder . 'soundcloud.js'
    );

    // combine JS
    Requirements::combine_files('js_min.js', $js_array);

    // external JS
    Requirements::javascript('//connect.soundcloud.com/sdk.js');

    // set locale
    if ($member = Member::CurrentUser()) {
      if ($member->Locale != i18n::get_locale()) {
        i18n::set_locale($member->Locale);
      }
    }
  }

  public function index() {
    return $this->renderWith(array('Share', 'Page'));
  }

  public function getPostInfo() {
    $params = $this->getURLParams();
    $id = (int)$params['ID'];

    if ($id == 0) {
      die('invalid ID');
    }

    $post = Post::get()->byID($id);

    $date_array = explode(' ', $post->Created);
    $date_array = explode('-', $date_array[0]);
    $date_array[0] = substr($date_array[0], 2);
    $date_array = array_reverse($date_array);

    $body = array(
      'Created' => implode('/', $date_array),
      'Genre' => $post->Genre()->Title,
      'GenreID' => $post->GenreID,
      'Member' => $post->Member()->FirstName,
      'MemberID' => $post->MemberID,
      'Text' => $post->Content,
      'Title' => $post->Title
    );

    $response = new SS_HTTPResponse();
    $response->addHeader("Content-type", "application/json");
    $response->setBody(json_encode($body));
    $response->output();
  }

  public function getToken() {
    return SecurityToken::inst()->getValue();
  }
}