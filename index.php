<?php

require_once 'run/start.php';
$content = new Content();

$themeDirectory = '/theme/public';

?>
<!DOCTYPE html>
<html lang="en">
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

	<link rel="icon" type="image/svg+xml" href="/theme/public/images/tobiasbierler.svg">
	<link rel="icon" type="image/png" href="/theme/public/images/tobiasbierler-128.png" sizes="128x128">
	<link rel="icon" type="image/png" href="/theme/public/images/tobiasbierler-256.png" sizes="256x256">
	<link rel="icon" type="image/png" href="/theme/public/images/tobiasbierler-512.png" sizes="512x512">
	<link rel="icon" type="image/png" href="/theme/public/images/tobiasbierler-1024.png" sizes="1024x1024">

</head>

<body>
</body>
</html>
