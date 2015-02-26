<?php
class MyMember extends Member {
  private static $db = array(
    'HideInList' => 'Boolean'
  );

  private static $has_one = array(
    'Color' => 'Color'
  );

  private static $has_many = array(
    'Posts' => 'Post'
  );
}