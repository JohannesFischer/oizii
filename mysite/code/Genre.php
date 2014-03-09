<?php

class Genre extends DataObject {

	private static $default_sort = 'Title ASC';

    private static $db = array(
		'Title' => 'Varchar(100)',
		'Description' => 'HTMLText'
    );
	
	private static $summary_fields = array(
        'Title'
    );
	
	public function canView($member = null) {
		return true;
    }
	
}