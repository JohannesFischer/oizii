<?php

class Share_Controller extends Controller {

	private $js_folder;
	private $per_page;
	private $post;

	private  static $allowed_actions = array (
		'bygenre',
		'comment',
		'getpost',
		'getPostInfo',
		'edit',
		'like',
		'likes',
		'login',
		'newpost',
		'post',
		'posts',
		'savepost',
		'search',
		'unlike',
		'user'
	);
	
	public function init() {
		parent::init();
		
		$this->per_page = 3;
		
		$theme_folder = 'themes/' . SSViewer::current_theme();
		$css_folder = $theme_folder . '/css/';
		$combined_folder = $theme_folder . '/_combinedfiles';
		
		Requirements::set_combined_files_folder($combined_folder);
		
		// include css
		Requirements::css($css_folder . 'foundation/css/normalize.css');
		Requirements::css($css_folder . 'foundation/css/foundation.min.css');
		// TODO pass target folder
		Requirements::css($css_folder . 'app.less', 'screen', BASE_PATH);
		
		// include js
		$this->js_folder = $theme_folder . '/javascript/';
		
		$js_array = array(
			'third-party/jquery-1.9.1.min.js',
			'third-party/angular.min.js',
			'third-party/angular-route.min.js',
			'third-party/angular-touch.min.js',
			'third-party/angular-animate.min.js',
			'third-party/ng-infinite-scroll.min.js',
			'third-party/foundation/foundation.min.js',
			'third-party/foundation/foundation/foundation.tooltip.js',
			'app.js',
			'controllers.js',
			'autocomplete.js',			
			'init.js',
			'soundcloud.js',
			'//connect.soundcloud.com/sdk.js'
		);
		foreach ($js_array as $file) {
			Requirements::javascript($this->js_folder . $file);
		}
		Requirements::combine_files('scripts.js', $js_array);
		
		// set locale
		if ($member = Member::CurrentUser()) {
			if ($member->Locale != i18n::get_locale()) {
				i18n::set_locale($member->Locale);
			}
		}		
	}
	
	public function index() {	
		$posts = Post::get()->sort('Created', 'DESC');
		
		$list = new PaginatedList($posts, $this->request);
		$list->setPageLength(POSTS_PER_PAGE);
		
		return $this->renderWith(array('Share', 'Page'), array(
			'Posts' => $list
		));
	}
	
	public function bygenre() {
		$params = $this->getURLParams();
		$genre_id = (int)$params['ID'];
		
		$genre = Genre::get()->filter('ID', $genre_id)->First();
		
		if ( ! $genre || ! $genre_id) $this->redirect('/');
		
		$posts = Post::get()->filter('GenreID', $genre_id)->sort('Created', 'DESC');
		
		return $this->renderWith(array('Share', 'Page'), array(
			'Posts' => $posts,
			'Genre' => $genre->Title
		));
	}
	
	public function comment() {
		$params = $this->getURLParams();
		$id = (int)$params['ID'];
		
		if ( ! Member::currentUserID()) return false;
		
		$postVars = $this->request->postVars();
		$text = trim($postVars['Text']);
		
		if ($text == '') return false;
		
		$comment = new Comment();
		$comment->Content = $this->nl2p($text);
		$comment->PostID = $id;
		$comment->MemberID = Member::currentUserID();
		$comment->write();
		
		$body = array(
			'Comment' => array(
				'Content' => $comment->Content,
				'Image' => $this->getGravatarImageForCurrentMember(60),
				'Member' => $comment->Member()->FirstName,
				'Created' => 'just now'
			)
		);
		$response = new SS_HTTPResponse(); 
		$response->addHeader("Content-type", "application/json");
		$response->setBody(json_encode($body));
		$response->output();
	}
	
	public function CurrentURL() {
		return $this->request->getURL();
	}
	
	public function edit() {
		$params = $this->getURLParams();
		$id = (int)$params['ID'];
		
		$post = Post::get()->byID($id);
		
		if ( ! $post || $post->MemberID != Member::currentUserID()) {
			$this->redirect('/');
		}
		
		$this->includeFormJS();
		
		$genres =Genre::get();
		
		return $this->renderWith(array('Page', 'NewPost'), array(
			'Edit' => true,
			'Genres' => $genres,
			'Post' => $post
		));
	}
	
	public function getGravatarImageForCurrentMember($size = 40) {
		return 'http://www.gravatar.com/avatar/' . md5(strtolower(trim(Member::CurrentUser()->Email))) . '?s=' . $size;
	}
	
	public function getPost() {
		$params = $this->getURLParams();
		$id = (int)$params['ID'];
		
		$this->post = Post::get()->filter('ID', $id)->First();
		
		if ($this->post) {
			return $this->renderWith(array('Page', 'Post'), array(
				'Post' => $this->post,
				'SoundcloudClientID' => defined('SOUNDCLOUD_CLIENT_ID') ? SOUNDCLOUD_CLIENT_ID : false
			));
		} else {
			$this->redirect('/');
		}
	}
	
	public function getPostInfo() {
		$params = $this->getURLParams();
		$id = (int)$params['ID'];
		
		if ($id == 0) {
			die('invalid ID');
		}
		
		$post = Post::get()->byID($id);
		
		$date_array = explode(' ', $post->Created);
		$date_array = explode('-', $date_array[0]);
		$date_array[0] = substr($date_array[0], 2);
		$date_array = array_reverse($date_array);
		
		$body = array(
			'Created' => implode('/', $date_array),
			'Genre' => $post->Genre()->Title,
			'GenreID' => $post->GenreID,
			'Member' => $post->Member()->FirstName,
			'MemberID' => $post->MemberID,
			'Text' => $post->Content,
			'Title' => $post->Title
		);
		
		$response = new SS_HTTPResponse(); 
		$response->addHeader("Content-type", "application/json");
		$response->setBody(json_encode($body));
		$response->output();
	}
	
	public function getTitle() {
		if ($this->post) {
			return $this->post->Title;
		}
		
		return false;
	}
	
	private function includeFormJS() {
		$js_files = array(
			'third-party/foundation/vendor/zepto.js',
			'third-party/foundation/vendor/custom.modernizr.js',
			'third-party/foundation/foundation.min.js',
			'third-party/foundation/foundation/foundation.forms.js'
		);
		foreach ($js_files as $file) {
			Requirements::javascript($this->js_folder . $file);
		}

		Requirements::customScript(<<<JS
if( ! /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
$(document).foundation();
}
JS
);
	}
	
	public function likes() {
		$params = $this->getURLParams();
		$id = (int)$params['ID'];
		
		// TODO map firstname & exclude current member
		$member = Member::get()->leftJoin('Like', 'Like.MemberID = Member.ID')->filter(array(
			'PostID' => $id
		))->sort('Member.FirstName', 'ASC');
		
		return $this->renderWith('Ajax', array(
			'Member' => $member
		)); 
	}
	
	public function login() {	
		return $this->renderWith(array('Login'));
	}
	
	public function newpost() {
		if ( ! Member::currentUserID()) $this->redirect('/');
		
		$this->includeFormJS();
		
		$genres = Genre::get();
		
		return $this->renderWith(array('NewPost'), array(
			'Edit' => false,
			'Genres' => $genres
		));
	}
	
	private function nl2p($string, $line_breaks = true, $xml = true) {

		$string = str_replace(array('<p>', '</p>', '<br>', '<br />'), '', $string);
		
		// It is conceivable that people might still want single line-breaks
		// without breaking into a new paragraph.
		if ($line_breaks == true) {
			return '<p>'.preg_replace(array("/([\n]{2,})/i", "/([^>])\n([^<])/i"), array("</p>\n<p>", '$1<br'.($xml == true ? ' /' : '').'>$2'), trim($string)).'</p>';
		}
		else {
			return '<p>'.preg_replace(
			array("/([\n]{2,})/i", "/([\r\n]{3,})/i","/([^>])\n([^<])/i"),
			array("</p>\n<p>", "</p>\n<p>", '$1<br'.($xml == true ? ' /' : '').'>$2'),
		
			trim($string)).'</p>';
		}
	}
	
	public function post() {
		return $this->renderWith(array('Post'), array(
			'Post' => array()
		));
	}
	
	public function posts() {
		return $this->renderWith(array('Posts'));
	}
	
	public function savepost() {
		if ( ! Member::currentUserID() || ! Director::is_ajax()) {
			exit;
		}
		
		// retrieve and validate data
		$postVars = $this->request->postVars();
		$title = $postVars['Title'];
		$text = $this->nl2p($postVars['Text']);
		$genre = $postVars['Genre'];
		$link = $postVars['Link'];
		$postID = isset($postVars['PostID']) ? (int)$postVars['PostID'] : false;
		
		// update or create new post
		if ($postID != false) {
			$post = Post::get()->byID($postID);
		} else {
			$post = new Post();	
		}
		$post->Title = $title;
		$post->Content = $text;
		$post->GenreID = (int)$genre > 0 ? $genre : NULL;
		$post->Link = $link;
		$post->MemberID = Member::currentUserID();
		$post->write();
		
		header('Content-type: application/json');
		if ($post) {
			echo json_encode(array('success' => array('ID' => $post->ID)));
		} else {
			echo json_encode(array('error'));
		}
	}
	
	public function search() {
		$params = $this->getURLParams();
		$search_term = $params['ID'];
		
		$posts = Post::get()->filter(array(
			'Title:PartialMatch' => $search_term
		));
		
		return $this->renderWith(array('Share', 'Page'), array(
			'Posts' => $posts,
			'SearchTerm' => $search_term
		)); 
	}
	
	public function unlike() {
		$params = $this->getURLParams();
		$id = (int)$params['ID'];
		
		$like = Like::get()->filter(array(
			'PostID' => $id,
			'MemberID' => Member::currentUserID()
		))->First();
		
		if ($like) {
			$like->delete();
		}
	}
	
	public function user() {
		$params = $this->getURLParams();
		$username = $params['ID'];
		
		$member = Member::get()->filter('FirstName', $username)->First();
		
		if ($member) {
			$posts = Post::get()->filter('MemberID', $member->ID)->sort('Created', 'DESC');
			$list = new PaginatedList($posts, $this->request);
			$list->setPageLength(POSTS_PER_PAGE);
		} else {
			$list = false;
		}
		
		return $this->renderWith(array('Share', 'Page'), array(
			'Posts' => $list,
			'UserName' => $username
		)); 
	}
	
}