<?php
$text = htmlspecialchars($_GET["text"]);
`c: && cd "\lab\e-guidedog\eGuideDog_TTS" && ekho.exe --request $text`;
$final_filename = "C:\lab\e-guidedog\eGuideDog_TTS\output.mp3";
if (file_exists($final_filename)) {
    header('Content-Type: audio/mpeg');
    header('Content-Length: ' . filesize($final_filename));
    header('Final-name: ' . $final_filename);
    header('Expires: Tue, 12 Mar 2012 04:00:25 GMT');
    flush();
    readfile($final_filename);  
} else {
    echo "<html><body>Error: $final_filename not exist!</body></html>";
}
?>
