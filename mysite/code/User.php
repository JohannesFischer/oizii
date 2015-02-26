<?php

class User_Controller extends Share_controller {
  private static $allowed_actions = array (
    'edit',
    'likes',
    'notifications',
    'playlist'
  );

  public function init() {
    parent::init();
  }

  public function edit() {
    if ( ! $member = MyMember::get()->filter('ID', Member::currentUserID())->First()) {
      //$this->redirect('/');
      die('could\'t find member');
    }

    //Create our fields
    $fields = new FieldList(
      new TextField('Name', '<span>*</span> Name (or Nickname)'),
      new EmailField('Email', '<span>*</span> Email'),
      new ConfirmedPasswordField('Password', 'New Password')
    );

    // Create action
    $actions = new FieldList(
      new FormAction('SaveProfile', 'Save')
    );

    // Create action
    $validator = new RequiredFields('FirstName', 'Email');

    //Create form
    $Form = new Form($this, 'save', $fields, $actions, $validator);

    //Populate the form with the current members data
    $Form->loadDataFrom($member->data());

    return $this->renderWith('Profile', array(
      'Form' => $Form,
      'Member' => $member
    ));
  }

  private function getLikes() {
    return Post::get()
           ->leftJoin('Like', 'Like.MemberID = ' . Member::currentUserID() . ' AND Like.PostID = Post.ID')
           ->where('Like.MemberID > 0')
           ->sort('Post.Created', 'DESC');
  }

  public function likes() {
    if ( ! Member::currentUserID()) {
      $this->redirect('/Security/login?BackURL=/user/likes');
    }

    $posts = $this->getLikes();

    return $this->renderWith(array('Share', 'Page'), array(
      'LikesPage' => true,
      'Posts' => $posts
    ));
  }

  public function playlist() {
    if ( ! Member::currentUserID()) {
      $this->redirect('/Security/login?BackURL=/user/playlist');
    }

    Requirements::javascript('themes/' . SSViewer::current_theme() . '/javascript/playlist.js');

    // get likes by MemberID and remove posts not having a YouTubeID
    $likes = $this->getLikes()->exclude('YouTubeID', '');

    return $this->renderWith(array('Page', 'Playlist'), array(
      'Likes' => $likes,
      'NoLikes'  => $likes->Count() == 0
    ));
  }
}