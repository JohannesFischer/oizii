<?php

class Content_Controller extends Share_Controller {

	private  static $allowed_actions = array (
		'get'
	);
	
	public function init() {
		parent::init();
	}
	
	public function get() {
		$params = $this->getURLParams();
		$page = (string)$params['ID'];
		
		$text = PageContent::get()->filter('Page', $page)->First();
		
		if ($page && $text) {
			return $this->renderWith(array('PageContent', 'Page'), array(
				'Post' => false,
				'Text' => $text->Content,
				'Title' => $text->Title
			));
		} else {
			$this->redirect('/');
		}
	}
	
	public function getMember() {
		return MyMember::get()->filter('HideInList', 0)->sort('Created DESC');
	}
	
}