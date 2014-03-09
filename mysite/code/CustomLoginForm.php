<?php

class CustomLoginForm extends MemberLoginForm {
	
    public function dologin($data) {
        if($this->performLogin($data)) {
                if(!$this->redirectByGroup($data))
                    Director::redirect(Director::baseURL());
        } else {
            if($badLoginURL = Session::get("BadLoginURL")) {
                Director::redirect($badLoginURL);
            } else {
                Director::redirectBack();
            }
        }      
    }
}