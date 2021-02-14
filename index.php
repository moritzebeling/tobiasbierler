<?php

require_once 'run/start.php';
$content = new Content();

$themeDirectory = '/theme/public';

?>
<!DOCTYPE html>
<html lang="de">
<head>
	<meta charset='utf-8'>
	<meta name='viewport' content='width=device-width,initial-scale=1'>

	<title>Tobias Bierler</title>

	<link rel='stylesheet' href='<?= $themeDirectory ?>/global.css'>
    <link rel='stylesheet' href='<?= $themeDirectory ?>/build/bundle.css'>

    <script>
        window.pageData = <?= json_encode( $content->toArray() ); ?>;
    </script>

	<script defer src='<?= $themeDirectory ?>/build/bundle.js'></script>

	<link rel="icon" type="image/svg+xml" href="/theme/images/tobiasbierler.svg">
	<link rel="icon" type="image/png" href="/theme/images/tobiasbierler-128.png" sizes="128x128">
	<link rel="icon" type="image/png" href="/theme/images/tobiasbierler-256.png" sizes="256x256">
	<link rel="icon" type="image/png" href="/theme/images/tobiasbierler-512.png" sizes="512x512">
	<link rel="icon" type="image/png" href="/theme/images/tobiasbierler-1024.png" sizes="1024x1024">

	<meta name="keywords" content="Tobias, Bierler, Architekt, Weimar"/>
	<meta name="description" content="Tobias Bierler short description in 120 characters"/>
	<meta name="copyright"content="Tobias Bierler">
	<meta name="language" content="de">
	<meta name="robots" content="index,follow" />
	<meta name="url" content="http://tobiasbierler.de">

	<meta name="og:site_name" content="Tobias Bierler"/>
	<meta name="og:title" content="Tobias Bierler"/>
	<meta name="og:type" content="website"/>
	<meta name="og:url" content="https://tobiasbierler.de"/>
	<meta name="og:image" content="/theme/images/tobiasbierler-1024.png"/>
	<meta name="og:description" content="Tobias Bierler short description in 120 characters"/>

</head>
<body></body>
</html>
