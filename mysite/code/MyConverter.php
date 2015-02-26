<?php

class MyConverter {
  public static function nl2p($string, $line_breaks = true, $xml = true) {
    $string = str_replace(array('<p>', '</p>', '<br>', '<br />'), '', $string);

    // It is conceivable that people might still want single line-breaks
    // without breaking into a new paragraph.
    if ($line_breaks == true) {
      return '<p>'.preg_replace(
        array("/([\n]{2,})/i", "/([^>])\n([^<])/i"),
        array("</p>\n<p>", '$1<br'.($xml == true ? ' /' : '').'>$2'),
        trim($string)).'</p>';
    } else {
      return '<p>'.preg_replace(
        array("/([\n]{2,})/i", "/([\r\n]{3,})/i","/([^>])\n([^<])/i"),
        array("</p>\n<p>", "</p>\n<p>", '$1<br'.($xml == true ? ' /' : '').'>$2'),
        trim($string)
      ).'</p>';
    }
  }
}