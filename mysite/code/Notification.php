<?php

class Notification extends DataObject {

    private static $db = array(
		'Read' => 'Boolean'
    );
	
	private static $has_one = array(
		'Post' => 'Post',
		'Member' => 'MyMember'
	);
	
	public function canCreate($member = NULL){ 
		return Permission::check('CMS_ACCESS_CMSMain', 'any', $member);
	}
	
	public function canView($member = null) {
		if (Permission::check('ADMIN')) {
			return true;
		} else if ($this->MemberID == Member::currentUserID())	{
			return Permission::check('CMS_ACCESS_CMSMain', 'any', $member);
		}
		return false;
    }

}