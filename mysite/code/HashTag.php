<?php

class HashTag extends DataObject {

	private static $db = array(
		'Title' => 'Varchar(100)'
    );
	
	private static $belongs_many_many = array(
		'Posts' => 'Post'
	);

}