<?php

class Data_Controller extends Controller {

	private  static $allowed_actions = array (
		'comment',
		'getLikes',
		'getPost',
		'getPosts',
		'like',
		'login',
		'isLoggedIn',
		'newPost'
	);
	
	//public function init() {
	//	parent::init();
	//	
	//	if ( ! Director::is_ajax()) {
	//		$response = new SS_HTTPResponse(); 
	//		$response->setStatusCode(400);
	//		$response->output();
	//	}
	//}
	
	private function _error($code = 400, $message = 'Forbidden') {
		$this->_jsonOut(array(
			'Code' => $code,
			'Content' => $message
		));
	}
	
	private function _forbidden() {
		return $this->_error(400, 'Forbidden');
	}
	
	private function _jsonOut($body) {
		$response = new SS_HTTPResponse(); 
		$response->addHeader("Content-type", "application/json");
		$response->setBody(json_encode($body));
		$response->output();
	}
	
	private function _nl2p($string, $line_breaks = true, $xml = true) {

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
	
	public function comment() {		
		if ( ! Member::currentUserID()) $this->_forbidden();
		
		$data = json_decode(file_get_contents('php://input'), true);
		$id = (int)$data['ID'];
		$text = trim($data['Text']);
		
		if ($id == 0 || $text == '') return false;
		
		$comment = new Comment();
		$comment->Content = $this->_nl2p($text);
		$comment->PostID = $id;
		$comment->MemberID = Member::currentUserID();
		$comment->write();
		
		$comments = Comment::get()->filter('PostID', $id)->sort('Created');
		$ar = new ArrayList();
		
		foreach($comments as $com) {
			$member = Member::get()->byId($com->MemberID);
			
			$ar->push(array(
				'Content' => $com->Content,				
				'Created' => $com->Created,
				'User' => array(
					'Name' => $member->FirstName,
					'Hash' => md5($member->Email)
				)
			));
		}
		
		return $this->_jsonOut($ar->toArray());
	}
	
	public function getLikes() {
		$params = $this->getURLParams();
		$id = (int)$params['ID'];
		
		$member = Member::get()->leftJoin('Like', 'Like.MemberID = Member.ID')->filter(array(
			'PostID' => $id
		))->sort('Member.FirstName', 'ASC');
		
		$members = array();
		foreach($member as $m) {
			array_push($members, array(
				'User' => array(
					'ID' => $m->ID,
					'Name' => $m->FirstName
				)
			));
		}
		
		$this->_jsonOut($members);
	}
	
	public function getPost() {
		$params = $this->getURLParams();
		$id = (int)$params['ID'];
		
		// fields to catch
		$fields = array(
			array('DATE_FORMAT(Post.Created, \'%Y-%m-%d\')', 'PostCreated'),
			'DailyMotionID',
			array('Genre.ID', 'GenreID'),
			array('Genre.Title', 'GenreTitle'),
			array('Member.ID', 'MemberID'),
			array('Member.FirstName', 'FirstName'),
			array('Post.Content', 'PostContent'),
			array('Post.ID', 'ID'),
			'Link',
			array('Post.Title', 'Title'),
			'VimeoID',
			'YouTubeID'
		);
		
		// Query
		$sqlQuery = new SQLQuery();
		$sqlQuery->setFrom('Post');
		foreach ($fields as $f) {
			$field = is_array($f) ? $f[0] : $f;
			$alias = isset($f[1]) ? $f[1] : NULL;
			
			$sqlQuery->selectField($field, $alias);	
		}
		$sqlQuery->addLeftJoin('Genre','GenreID = Genre.ID');
		$sqlQuery->addLeftJoin('Member','Post.MemberID = Member.ID');
		$sqlQuery->addWhere('Post.ID = ' . $id);
		
		// Execute and return a Query object
		$result = $sqlQuery->execute();
		$rowArray= $result->first();
		$arrayList = new ArrayList();
		
		$ar = array(
			'CanEdit' => Member::currentUserID() == $rowArray['MemberID'],
			'Content' => $rowArray['PostContent'],
			'Created' => $rowArray['PostCreated'],
			'DailyMotionID' => $rowArray['DailyMotionID'],
			'Genre' => array(
				'ID' => $rowArray['GenreID'],
				'Title' => $rowArray['GenreTitle']
			),
			'ID' => $rowArray['ID'],
			'Link' => $rowArray['Link'],
			'Title' => $rowArray['Title'],
			'User' => array(
				'ID' => $rowArray['MemberID'],
				'Name' => $rowArray['FirstName']
			),
			'VimeoID' => $rowArray['VimeoID'],
			'YouTubeID' => $rowArray['YouTubeID']
		);
		
		// has liked
		$like = Like::get()->filter('PostID', $ar['ID']);
		$ar['HasLiked'] = $like->count() == 1;
		
		// add Comments
		$comments = Comment::get()->filter('PostID', $ar['ID'])->sort('Created', 'ASC');
		$ar['Comments'] = array();
		
		foreach($comments->toArray() as $com) {
			$member = Member::get()->byId($com->MemberID);
			$c = array(
				'Content' => $com->Content,
				'Created' => $com->Created,
				'VideoID' => $com->VideoID,
				'User' => array(
					'Hash' => md5(strtolower(trim($member->Email))),
					'ID' => $member->ID,
					'Name' => $member->FirstName
				)
			);
			array_push($ar['Comments'], $c);
		}
		
		// add Likes
		$likes = Like::get()->filter('PostID', $ar['ID']);
		$ar['Likes'] = $likes->Count();
		
		$arrayList->push($ar);
		$arrayList = $arrayList->toArray();
		
		return $this->_jsonOut($arrayList[0]);
	}
	
	public function getPosts() {
		$get_data = $this->request->getVars();
		
		// filter
		$exclude_id = isset($get_data['exclude']) ? (int)$get_data['exclude'] : false;
		$genre_id = isset($get_data['genreId']) ? (int)$get_data['genreId'] : false;
		$likes = isset($get_data['likes']) ? (bool)$get_data['likes'] : false;
		$limit = isset($get_data['limit']) ? (int)$get_data['limit'] : false;
		$member_id = isset($get_data['userId']) ? (int)$get_data['userId'] : false;
		$random = isset($get_data['random']) ? (bool)$get_data['random'] : false;
		$start = isset($get_data['start']) ? (int)$get_data['start'] : 0;
		
		$sqlQuery = new SQLQuery();
		$sqlQuery->setFrom('Post');
		$sqlQuery->selectField('DATE_FORMAT(Post.Created, \'%Y-%m-%d\')', 'PostCreated');
		$sqlQuery->selectField('Color.Hex');
		$sqlQuery->addLeftJoin('Genre','GenreID = Genre.ID');
		$sqlQuery->selectField('Genre.Title', 'GenreTitle');
		$sqlQuery->selectField('Post.GenreID', 'GenreID');
		$sqlQuery->selectField('Post.MemberID', 'MemberID');
		$sqlQuery->selectField('Post.Title');
		$sqlQuery->selectField('Post.ID', 'ID');
		$sqlQuery->addLeftJoin('Member', 'MemberID = Member.ID');
		$sqlQuery->addLeftJoin('MyMember', 'MemberID = MyMember.ID');
		$sqlQuery->addLeftJoin('Color', 'MyMember.ColorID = Color.ID');
		
		// liked only
		if ($likes) {
			$sqlQuery->addLeftJoin('Like', 'Post.MemberID = Like.MemberID');
			$sqlQuery->addGroupBy('Post.ID');
		}
		// exclude
		if ($exclude_id) {
			$sqlQuery->addWhere('Post.ID != ' . $exclude_id);
		}
		// filter | GenreID
		if ($genre_id) {
			$sqlQuery->addWhere('Post.GenreID = ' . $genre_id);
		}
		// filter | MemberID
		if ($member_id && ! $likes) {
			$sqlQuery->addWhere('Post.MemberID = ' . $member_id);
		}
		// sorting
		if ($random) {
			$sqlQuery->setOrderBy('RAND(Post.ID)');
		} else {
			$sqlQuery->setOrderBy('Post.Created DESC');	
		}
		if ($limit && ! $start) {
			$sqlQuery->setLimit($limit);
		} else if ($limit && $start) {
			$sqlQuery->setLimit($limit, $start);
		}
		
		// Execute and return a Query object
		$result = $sqlQuery->execute();
		
		$arrayList = new ArrayList();
		foreach($result as $rowArray) {
			$arrayList->push(array(
				'Created' => $rowArray['PostCreated'],
				'Genre' => array(
					'ID' => $rowArray['GenreID'],
					'Title' => $rowArray['GenreTitle']
				),
				'ID' => $rowArray['ID'],
				'Title' => $rowArray['Title'],
				'User' => array(
					'HEX' => $rowArray['Hex'],
					'ID' => $rowArray['MemberID'],
					'Name' => $rowArray['FirstName']
				)
			));
		}
		
		$this->_jsonOut($arrayList->toArray());
	}
	
	public function like() {
		$params = $this->request->getVars();
		$id = isset($params['postId']) ? (int)$params['postId'] : 0;
		
		if ( ! Member::currentUserID() || $id === 0) return $this->_forbidden();
		
		$like_count = Like::get()->filter(array(
			'PostID' => $id,
			'MemberID' => Member::currentUserID()
		))->Count();
		
		if ($like_count == 0) {
			$like = new Like();
			$like->PostID = $id;
			$like->MemberID = Member::currentUserID();
			$like->write();
		} else {
			return $this->unlike();
		}
		
		$likes = Like::get()->filter('PostID', $id);
		$this->_jsonOut(array('Likes' => $likes->count()));
	}
	
	public function login() {		
		$data = json_decode(file_get_contents('php://input'), true);
		
		if ( ! $member = Member::CurrentUser()) {
		
			if (is_array($data) && isset($data['email']) && isset($data['password'])
				&& filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
				
			} else {
				return $this->_error(400, 'Invalid input');
			}
			
			$member = MemberAuthenticator::authenticate(array(
				'Email' => $data['email'], 
				'Password' => filter_var($data['password'], FILTER_SANITIZE_STRING)
			));
			
			if ($member) {
				$member->logIn();
			} else {
				return $this->_error(400, 'Invalid login data');
			}
		}
		
		return $this->_jsonOut(array(
			'User' => array(
				'Name' => $member->FirstName	
			)
		));
	}
	
	public function isLoggedIn() {
		if ($member = Member::CurrentUser()) {
			$body = array(
				'User' => array(
					'Name' => $member->FirstName	
				)
			);
		} else {
			$body = array(
				'Code' => '400',
				'Content' => 'Invalid session'
			);
		}
		return $this->_jsonOut($body);
	}
	
	public function newPost() {
		if ( ! Member::currentUserID()) return $this->_forbidden();
		
		// retrieve and validate data
		$data = json_decode(file_get_contents('php://input'), true);
		
		// TODO validate		
		if ( ! array_key_exists('Title', $data) || ! array_key_exists('Link', $data) || ! array_key_exists('Genre', $data)) {
			return $this->_error();
		}
		
		$title = $data['Title'];
		$text = isset($data['Content']) ? $this->_nl2p($data['Content']) : '';
		$genre_id = (int)$data['Genre']['ID'];
		$link = $data['Link'];
		$postID = isset($data['ID']) ? (int)$data['ID'] : false;
		
		// update or create new post
		if ($postID != false) {
			$post = Post::get()->byID($postID);
		} else {
			$post = new Post();	
		}
		$post->Title = $title;
		$post->Content = $text;
		$post->GenreID = $genre_id;
		$post->Link = $link;
		$post->MemberID = Member::currentUserID();
		$post->write();
		
		if ($post) {
			return $this->_jsonOut(array('ID' => $post->ID));
		} else {
			return $this->_error(400, 'Error saving post');
		}
	}
	
	public function unlike() {
		$params = $this->request->getVars();
		$id = isset($params['postId']) ? (int)$params['postId'] : 0;
		
		if ( ! Member::currentUserID() || $id === 0) return $this->_forbidden();
		
		$like = Like::get()->filter(array(
			'PostID' => $id,
			'MemberID' => Member::currentUserID()
		))->First();
		
		if ($like) {
			$like->delete();
		}
		
		$likes = Like::get()->filter('PostID', $id);
		$this->_jsonOut(array('Likes' => $likes->count()));
	}
	
}