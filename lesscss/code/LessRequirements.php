<?php
class LessRequirements extends Requirements_Backend {

	function css($file, $media = null, $target_folder = null) {
		if (preg_match('/\.less$/i', $file)) {
			$out = preg_replace('/\.less$/i', '.css', $file);
			if(isset($_GET['flush']) && Permission::check('ADMIN')) {
				@unlink(Director::getAbsFile($out));
			}
			$target = $target_folder ? $target_folder . '/' . $out : Director::getAbsFile($out);
			//var_dump($target_folder);
			lessc::ccompile(Director::getAbsFile($file), $target);
			$file = $out;
		}
		return parent::css($file, $media);
	}

}