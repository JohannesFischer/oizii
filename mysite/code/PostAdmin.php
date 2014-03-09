<?php

class PostAdmin extends ModelAdmin {
    
    public static $managed_models = array(
        'Post'
    );
 
    static $url_segment = 'posts'; 
    static $menu_title = 'Share';
 
}