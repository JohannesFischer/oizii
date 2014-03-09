<?php

class ShareAdmin extends ModelAdmin {
    
    public static $managed_models = array(
        'Color',
		'Genre',
		'PageContent',
		'Comment'
    );
 
    static $url_segment = 'shareadmin'; 
    static $menu_title = 'Share Admin';
 
}