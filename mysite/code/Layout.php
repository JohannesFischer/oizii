<?php

class Layout_Controller extends Controller {
  private  static $allowed_actions = array (
    'about',
    'login',
    'newpost',
    'playlist',
    'post',
    'posts',
    'search'
  );

  public function init() {
    parent::init();

    // set locale
    if ($member = Member::CurrentUser()) {
      if ($member->Locale != i18n::get_locale()) {
        i18n::set_locale($member->Locale);
      }
    }
  }

  public function about() {
    $data = array();
    $page = PageContent::get()->First();

    if ($page) {
      $data = array(
        'Text' => $page->Content,
        'Title' => $page->Title
      );
    }
    return $this->renderWith(array('About'), $data);
  }

  public function getGravatarImageForCurrentMember($size = 40) {
    return 'http://www.gravatar.com/avatar/' . md5(strtolower(trim(Member::CurrentUser()->Email))) . '?s=' . $size;
  }

  public function getMember() {
    return MyMember::get()->filter('HideInList', 0)->sort('Created DESC');
  }

  public function getToken() {
    return SecurityToken::inst()->getValue();
  }

  private function includeFormJS() {
    Requirements::javascript($this->theme_folder . 'bower/foundation/js/vendor/modernizr.js');

    Requirements::customScript(<<<JS
if( ! /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
$(document).foundation();
}
JS
);
  }

  public function login() {
    return $this->renderWith('Login');
  }

  public function newpost() {
    if ( ! Member::currentUserID()) $this->redirect('/');

    $this->includeFormJS();

    $genres = Genre::get();

    return $this->renderWith(array('NewPost'), array(
      'Edit' => false,
      'Genres' => $genres
    ));
  }

  public function playlist() {
    return $this->renderWith('playlist');
  }

  public function post() {
    return $this->renderWith('Post');
  }

  public function posts() {
    return $this->renderWith(array('Posts'), array(
      'Genres' => Genre::get()->sort('Title'),
      'Users' => MyMember::get()->filter('HideInList', false)->sort('FirstName')
    ));
  }

  public function search() {
    return $this->renderWith('Posts');
  }
}