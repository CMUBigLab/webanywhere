<?php

$base_dir = 'F:\TEMP';

if (isset($_GET["cache"])) {
    $cache = $_GET["cache"];
} else {
    $cache = 0;
}

if (isset($_GET["mtts"])) {
    $mtts = $_GET["mtts"];
} else {
    $mtts = 0;
}

$text = $_GET["text"];

if (strlen($text) < 20) {
    $filename = "$text.mp3";
} else {
    $filename = "output.mp3";
}

$filepath = "$base_dir\\$filename";

`c: && cd "\lab\e-guidedog\eGuideDog_TTS" && ekho.exe --request $text -o $filepath`;

if (file_exists($filepath)) {
    header('Content-Type: audio/mpeg');
    header('Content-Length: ' . filesize($filepath));
    header('Final-name: ' . $filepath);
    header('Expires: Tue, 12 Mar 2012 04:00:25 GMT');
    flush();
    readfile($filepath);  
} else {
    echo "<html><body>Error: $filepath not exist!</body></html>";
}
?>
