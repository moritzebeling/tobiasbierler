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
</head>

<body>
</body>
</html>
