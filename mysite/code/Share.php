<?php

class Share_Controller extends Controller {

	private $theme_folder;
	private $per_page;
	private $post;

	private  static $allowed_actions = array (
		'about',
		'comment',
		'getPostInfo',
		'edit',
		'like',
		'likes',
		'login',
		'newpost',
		'player',
		'playlist',
		'post',
		'posts',
		'savepost',
		'search',
		'unlike',
		'user'
	);
	
	public function init() {
		parent::init();
		
		$this->theme_folder = 'themes/' . SSViewer::current_theme() . '/'; // $this->ThemeDir()

		Requirements::set_combined_files_folder($this->theme_folder . '_combinedfiles');
		
		// include CSS
		$css_folder = $this->theme_folder . 'css/';
		
		$css_array = array(
			$this->theme_folder . 'bower/foundation/css/normalize.css',
			$this->theme_folder . 'bower/foundation/css/foundation.css'
		);
		
		if (Director::isLive()) {
			array_push($css_array, $css_folder . 'app.css');
		}
		// combine CSS
		Requirements::combine_files('css_min.css', $css_array);
		
		// inlcude LESS file in DEV environments
		if (Director::isDev()) {
			Requirements::css($css_folder . 'app.less');
		}
		
		// include JS
		$js_folder = $this->theme_folder . 'javascript/';
		
		$js_array = array(
			$this->theme_folder . 'bower/jquery/dist/jquery.min.js',
			$this->theme_folder . 'bower/angular/angular.min.js',
			$this->theme_folder . 'bower/angular-route/angular-route.min.js',
			$this->theme_folder . 'bower/angular-touch/angular-touch.min.js',
			$this->theme_folder . 'bower/angular-cookies/angular-cookies.min.js',
			$this->theme_folder . 'bower/angular-animate/angular-animate.min.js',
			$this->theme_folder . 'bower/ng-infinite-scroller-origin/build/ng-infinite-scroll.min.js',
			$this->theme_folder . 'bower/foundation/js/foundation.min.js',
			$js_folder . 'app.js',
			$js_folder . 'controllers.js',
			$js_folder . 'autocomplete.js',
			$js_folder . 'playlist.js',
			$js_folder . 'init.js',
			$js_folder . 'soundcloud.js'
		);
		
		// combine JS
		Requirements::combine_files('js_min.js', $js_array);
		
		// external JS
		Requirements::javascript('//connect.soundcloud.com/sdk.js');
		
		// set locale
		if ($member = Member::CurrentUser()) {
			if ($member->Locale != i18n::get_locale()) {
				i18n::set_locale($member->Locale);
			}
		}		
	}
	
	public function index() {
		return $this->renderWith(array('Share', 'Page'));
	}
	
	public function about() {
		$data = array();
		$page = PageContent::get()->First();
		
		if ($page) {
			$data = array(
				'Text' => $page->Content,
				'Title' => $page->Title
			);
		}
		
		return $this->renderWith(array('About'), $data);
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
	
	public function getMember() {
		return MyMember::get()->filter('HideInList', 0)->sort('Created DESC');
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
	
	public function getToken() {
				return SecurityToken::inst()->getValue();
	}
	
	private function includeFormJS() {
    Requirements::javascript($this->theme_folder . 'bower/foundation/js/vendor/modernizr.js');

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
		return $this->renderWith('Login');
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
	
	public function player() {
		return $this->renderWith('player');
	}
	
	public function playlist() {
		return $this->renderWith('playlist');
	}
	
	public function post() {
		return $this->renderWith('Post');
	}
	
	public function posts() {
		return $this->renderWith(array('Posts'), array(
			'Genres' => Genre::get()->sort('Title'),
			'Users' => MyMember::get()->filter('HideInList', false)->sort('FirstName')
		));
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
		return $this->renderWith('Posts'); 
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