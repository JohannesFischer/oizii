<?php

class Autocomplete_Controller extends Controller {

	private static $allowed_actions = array (
		'index'
	);
	
	public function init() {
		parent::init();
	}
	
	public function index() {
		$search_term = Convert::raw2sql($this->request->getVar('search'));
		
		$genres = Genre::get()->filter(array(
			'Title:PartialMatch' => $search_term
		))->sort('Title');
		
		$posts = Post::get()->filter(array(
			'Title:PartialMatch' => $search_term
		))->sort('Title');
		
		$body = array(
			'genres' => array(),
			'posts' => array()
		);
		
		$body['Genre'] = $this->populateBodyArray($genres);
		$body['Posts'] = $this->populateBodyArray($posts);
		
		$response = new SS_HTTPResponse(); 
		$response->addHeader("Content-type", "application/json");
		$response->setBody(json_encode($body));
		$response->output();
	}
	
	private function populateBodyArray($result) {
		$target = array();
		
		foreach ($result as $item) {
			$target[] = array(
				'ID' => $item->ID,
				'Title' => $item->Title
			);
		}
		
		return $target;
	}
	
}