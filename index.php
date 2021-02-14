<?php

require_once 'run/start.php';
$content = ( new Content() )->toArray();

$themeDirectory = '/theme/public';

?>
<!DOCTYPE html>
<html lang="de">
<head>
	<meta charset='utf-8'>
	<meta name='viewport' content='width=device-width,initial-scale=1'>

	<title><?= $content['title'] ?></title>
	<meta name="og:site_name" content="<?= $content['title'] ?>"/>
	<meta name="og:title" content="<?= $content['title'] ?>"/>

	<link rel='stylesheet' href='<?= $themeDirectory ?>/global.css'>
    <link rel='stylesheet' href='<?= $themeDirectory ?>/build/bundle.css'>

    <script>
        window.pageData = <?= json_encode( $content ); ?>;
    </script>

	<script defer src='<?= $themeDirectory ?>/build/bundle.js'></script>

	<link rel="icon" type="image/svg+xml" href="/theme/images/tobiasbierler.svg">
	<link rel="icon" type="image/png" href="/theme/images/tobiasbierler-128.png" sizes="128x128">
	<link rel="icon" type="image/png" href="/theme/images/tobiasbierler-256.png" sizes="256x256">
	<link rel="icon" type="image/png" href="/theme/images/tobiasbierler-512.png" sizes="512x512">
	<link rel="icon" type="image/png" href="/theme/images/tobiasbierler-1024.png" sizes="1024x1024">
	<meta name="og:image" content="<?= $content['url'] ?>/theme/images/tobiasbierler-1024.png"/>

	<?php if( isset( $content['keywords'] ) ): ?>
		<meta name="keywords" content="<?= implode(', ',$content['keywords']) ?>"/>
	<?php endif ?>

	<?php if( isset( $content['description'] ) ): ?>
		<meta name="og:description" content="<?= $content['description'] ?>"/>
		<meta name="description" content="<?= $content['description'] ?>"/>
	<?php endif ?>

	<meta name="url" content="<?= $content['url'] ?>">
	<meta name="og:url" content="<?= $content['url'] ?>"/>

	<meta name="copyright" content="Tobias Bierler">
	<meta name="generator" content="Moritz Ebeling">
	<meta name="language" content="de">
	<meta name="robots" content="index,follow" />
	<meta name="og:type" content="website"/>

</head>
<!-- This website was made by Moritz Ebeling https://moritzebeling.com -->
<body></body>
</html>
