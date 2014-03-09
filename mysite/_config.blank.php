<?php

global $project;
$project = 'mysite';

global $databaseConfig;
$databaseConfig = array(
	"type" => 'MySQLDatabase',
	"server" => '',
	"username" => '',
	"password" => '',
	"database" => '',
	"path" => '',
);

MySQLDatabase::set_connection_charset('utf8');

// Set the current theme
SSViewer::set_theme('share');

// Set the site locale
i18n::set_locale('en_US');

Object::useCustomClass('Member', 'MyMember');

// set your soundcloud client ID to enable the embeded soundcloud widget
// more information can be found on: http://developers.soundcloud.com/docs
// define('SOUNDCLOUD_CLIENT_ID', '');