<?php

header('Content-type: application/xml; charset=utf-8');

require_once 'run/start.php';
$content = (new Content())->toArray();

$modified = date("Y-m-d",strtotime("-1 month"));

$domain = 'https://tobiasbierler.de';

echo '<?xml version="1.0" encoding="UTF-8"?>';
?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">

    <url>
        <loc><?= $domain ?></loc>
        <lastmod><?= $modified ?></lastmod>
        <changefreq>monthly</changefreq>
        <priority>1</priority>
    </url>

    <?php foreach( $content['pages'] as $page ): ?>
        <url>

            <loc><?= $domain . DS . $page['url'] ?></loc>
            <lastmod><?= $modified ?></lastmod>
            <changefreq>monthly</changefreq>
            <priority>0.7</priority>

            <?php foreach( $page['images'] as $image ): ?>
                <image:image>
                    <image:loc><?=  $domain . DS . $image['path'] . DS . $image['filename'] ?></image:loc>
                </image:image>
            <?php endforeach ?>

        </url>
    <?php endforeach ?>

</urlset>
