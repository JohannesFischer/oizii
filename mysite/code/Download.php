<?php

class Download_Controller extends Controller {

	private  static $allowed_actions = array (
		'file'
	);
	
	public function init() {
		parent::init();
	}
	
	public function index() {
		Director::redirect('/');
	}
	
	public function file() {
		$params = $this->getURLParams();
		$id = (int)$params['ID'];
		
		$file = File::get()->filter(array(
			'ID' => $id
		))->First();
		
		if ($file) {
			$path = ASSETS_PATH . str_replace('assets', '', $file->FileName);
			
			return SS_HTTPRequest::send_file(file_get_contents($path), $file->Name);
		} else {
			die('File not found');
		}
	}
	
}