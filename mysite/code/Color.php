<?php

class Color extends DataObject {
  private static $default_sort = 'Title ASC';

  private static $db = array(
    'Hex' => 'Varchar(6)',
    'Title' => 'Varchar(100)'
  );

  private static $summary_fields = array(
    'Title',
    'Hex'
  );

  public function canCreate($member = NULL){
    // kinda useless because default ??
    return Permission::check('ADMIN');
  }

  public function canDelete($member = NULL){
    return Permission::check('ADMIN');
  }

  public function canEdit($member = NULL){
    return Permission::check('ADMIN');
  }

  public function canView($member = null) {
    return Permission::check('CMS_ACCESS_CMSMain', 'any', $member);
  }
}