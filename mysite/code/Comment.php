<?php

class Comment extends DataObject {
	
	private static $db = array(
		'Content' => 'HTMLText',
		'VideoID' => 'Varchar'
	);
	
	private static $has_one = array(
		'Post' => 'Post',
		'Member' => 'Member'
	);
	
	private static $summary_fields = array(
		'Post.Title' => 'Title',
		'Member.FirstName' => 'Username'
    );
	
	public function canCreate($member = NULL){ 
		return Permission::check('CMS_ACCESS_CMSMain', 'any', $member);
	}
	
	public function canDelete($member = NULL){ 
		if (Permission::check('ADMIN') || $this->MemberID == Member::currentUserID()) { 
			return true;
		}
		return false;
	}
	
	public function canEdit($member = NULL){ 
		if (Permission::check('ADMIN') || $this->MemberID == Member::currentUserID()) { 
			return true;    
		}
		return false;
	}
	
	public function canView($member = null) {
		return Permission::check('CMS_ACCESS_CMSMain', 'any', $member);
    }
	
	public function getGravatarImage($size = 80) {
		return 'http://www.gravatar.com/avatar/' . md5(strtolower(trim($this->Member()->Email))) . '?s=' . $size;
	}
	
	private function getYouTubeID() {
		// link with ?|&v=ID
		if (strrpos($this->Content, 'youtube.com')) {
			preg_match('/.*v=([^&<.]*)/', $this->Content, $match);
			return $match[1];
		}
		// embed link http://youtu.be/ID
		if (strrpos($this->Content, 'youtu.be')) {
			preg_match('/.*youtu.be\/([^?&<.]*)/', $this->Content, $match);
			return $match[1];
		}
		
		return false;
	}
	
	public function hasVideoID() {
		return $this->VideoID != NULL;
	}
	
	public function onBeforeWrite() {
		if ($this->getYouTubeID()) {
			$this->VideoID = $this->getYouTubeID();	
		}		
		
		parent::onBeforeWrite();
	}
	
	public function VideoPreview() {
		//$this->VideoID
		//$service = new RestfulService("https://gdata.youtube.com/feeds/api/videos/" . $this->VideoID . "?v=2", 3600);
        //$twitter->setQueryString($params);
//        $conn = $service->request();
//        $msgs = $twitter->getValues($conn, "entry");
//		Debug::dump($msgs);
		
		$data = new ArrayData(array(
			'Image' => '',
			'Title' => 'Video Title'
		));
		
		return $data;
	}

}