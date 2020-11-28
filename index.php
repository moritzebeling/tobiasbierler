<?php

require_once 'run/start.php';

$content = new Content();

?>
<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset='utf-8'>
	<meta name='viewport' content='width=device-width,initial-scale=1'>

	<title>Tobias Bierler</title>

	<link rel='stylesheet' href='/frontend/public/global.css'>
    <link rel='stylesheet' href='/frontend/public/build/bundle.css'>

    <script>
        window.pageData = <?= json_encode( $content->toArray() ); ?>;
    </script>

	<script defer src='/frontend/public/build/bundle.js'></script>
</head>

<body>
</body>
</html>
