<?php

class Post extends DataObject {

	private static $default_sort = 'Created DESC';

    private static $db = array(
		'Content' => 'HTMLText',
		'DailyMotionID' => 'Varchar(30)',
		'Title' => 'Varchar(100)',
		'Link' => 'Varchar(250)',
		'VimeoID' => 'Varchar(20)',
		'YouTubeID' => 'Varchar(20)'
    );
	
	private static $has_one = array(
		'File' => 'File',
		'Genre' => 'Genre',
		'Member' => 'MyMember'
	);
	
	private static $has_many = array(
		'Comments' => 'Comment',
		'Likes' => 'Like'
	);
	
	private static $many_many = array(
		'HashTags' => 'HashTag'
	);
	
	private static $summary_fields = array(
        'Title' => 'Title',
		'Genre.Title' => 'Genre',
		'Member.FirstName' => 'Username'
    );
	
	public function canCreate($member = NULL){ 
		return Permission::check('CMS_ACCESS_CMSMain', 'any', $member);
	}
	
	public function canDelete($member = NULL){ 
		return Permission::check('ADMIN') || $this->MemberID == Member::currentUserID();
	}
	
	public function canEdit($member = NULL){ 
		return Permission::check('ADMIN') || $this->MemberID == Member::currentUserID();
	}
	
	public function canView($member = null) {
		// enable DataFormatter requests
		if ( ! $member) {
			return true;
		}
		if (Permission::check('ADMIN') || $this->MemberID == Member::currentUserID())	{
			return Permission::check('CMS_ACCESS_CMSMain', 'any', $member);
		}
		return false;
    }
	
	public function getCMSFields() {
		$dropdown_values = Genre::get()->map('ID', 'Title');    
		
		return new FieldList(
			new TextField('Title'),
			new HTMLEditorField('Content', 'Text'),
			new DropdownField('GenreID', 'Genre', $dropdown_values, 0, null, '-- select genre --'),
			// adjust the max upload size to your server settings
			new UploadField('File', 'File (max. 16MB)'),
			new TextField('Link', 'Youtube, Soundcloud, Dailymotion or Vimeo Link')
		);
	}

	public function getDailyMotionID() {
		$elements = explode('/', $this->Link);
		$id_raw = explode('_', end($elements));
		if (is_array($id_raw)) {
			return $id_raw[0];
		}
		return false;
	}
	
	public function getLikes() {
		return Member::get()
		       ->leftJoin('Like', 'Like.MemberID = Member.ID')
		       ->where('Like.PostID = ' . $this->ID)
		       ->exclude('ID', Member::currentUserID());
	}
	
	public function getPostsInGenre() {
		return Post::get()
		       ->filter('GenreID', $this->GenreID)
		       ->exclude('ID', $this->ID)
		       ->limit(5)
		       ->sort('RAND()');
	}
	
	public function getPostsFromUser() {
		return Post::get()
		       ->filter('MemberID', $this->MemberID)
		       ->exclude('ID', $this->ID)
		       ->limit(5)
		       ->sort('RAND()');
	}
	
	public function getStrippedContent() {
		return strip_tags($this->Content);
	}
	
	public function getVimeoID() {
		// embed link http://vimeo.com/ID
		if (strrpos($this->Link, 'vimeo.com')) {
			preg_match('/.*vimeo.com\/([^?]*)/', $this->Link, $match);
			return $match[1];
		}
		
		return false;
	}
	
	public function getYouTubeID() {
		// link with ?|&v=ID
		if (strrpos($this->Link, 'v=')) {
			preg_match('/.*v=([^&]*)/', $this->Link, $match);
			return $match[1];
		}
		// embed link http://youtu.be/ID
		if (strrpos($this->Link, 'youtu.be')) {
			preg_match('/.*youtu.be\/([^?]*)/', $this->Link, $match);
			return $match[1];
		}
		
		return false;
	}
	
	public function hasLiked() {
		return Like::get()->filter(array(
			'MemberID' => Member::currentUserID(),
			'PostID' => $this->ID
		))->First();
	}
	
	public function onAfterWrite() {
		parent::onAfterWrite();
		
		
	}
	
	public function onBeforeWrite() {
		parent::onBeforeWrite();
		
		// set MemberID
		if ( ! $this->MemberID) {
			$this->MemberID = Member::currentUserID();
		}
		// stores extracted vimeo id if available
		if (preg_match('/vimeo/', $this->Link)) {
			$this->VimeoID = $this->getVimeoID();
		}
		// stores extracted youtube id if available
		elseif (preg_match('/youtu(.)?be/', $this->Link)) {
			$this->YouTubeID = $this->getYouTubeID();
		}
		// stores extracted Dailymotion ID if available
		elseif (preg_match('/dailymotion/', $this->Link)) {
			$this->DailyMotionID = $this->getDailyMotionID();
		}
		
		// get tags from Content
		preg_match_all('/#(\w+)/', $this->Content, $matches);
		
		// current HashTags from DB if available
		$hash_tags = $this->HashTags();
		
		if ($hash_tags->count() > 0) {
			$hash_tags->map('Title')->toArray();
		}
		$current_tags = is_array($hash_tags) ? array_values($hash_tags) : array();
		
		$submitted_tags = isset($matches[1]) ? $matches[1] : array();
		
		if (count($submitted_tags) > 0) {
			// remove hash tags not in submitted Content
			foreach($current_tags as $tag) {
				if ( ! in_array($tag, $submitted_tags)) {
					$hash_tag = HashTag::get()->filter('Title', $tag)->first();
					$this->HashTags()->remove($hash_tag);
				}
			}
			
			// save new tags
			foreach($submitted_tags as $tag) {
				if ( ! preg_match('/[a-zA-z0-9]+/', $tag)) continue;
				if ( ! in_array($tag, $current_tags)) {
					$hashtag = HashTag::get()->filter('Title', $tag)->First();
					
					if ( ! $hashtag) {
						$hashtag = new HashTag();
						$hashtag->Title = $tag;
						$hashtag->write();
					}
					
					$this->HashTags()->add($hashtag);
				}
			}
		} else {
			// remove all hash tags
			foreach($hash_tags as $tag) {
				$this->HashTags()->remove($tag);
			}
		}
		
		// remove hashtags in Content
		$content = preg_replace('/(\s)?#\w+/i', '', $this->Content);
		$this->Content = trim($content);
	}

}