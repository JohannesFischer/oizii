<?php

class Like extends DataObject {
  private static $has_one = array(
    'Post' => 'Post',
    'Member' => 'Member'
  );
}