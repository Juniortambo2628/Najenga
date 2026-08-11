<?php
require 'C:\wamp64\www\Najenga\vendor\autoload.php';

use thiagoalessio\TesseractOCR\TesseractOCR;

echo "<h1>OCR Debugger V2</h1>";

$exePath = 'C:\Tessaract\tesseract.exe';

echo "<h2>1. File Check</h2>";
if (file_exists($exePath)) {
    echo "File exists at: $exePath<br>";
    echo "Permissions: " . substr(sprintf('%o', fileperms($exePath)), -4) . "<br>";
} else {
    echo "❌ File NOT found at: $exePath<br>";
}

echo "<h2>2. Exec Test</h2>";
$output = [];
$return_var = 0;
exec('"' . $exePath . '" --version 2>&1', $output, $return_var);
echo "Return Var: $return_var<br>";
echo "Output:<pre>" . implode("\n", $output) . "</pre>";

echo "<h2>3. Library Test</h2>";
try {
    $ocr = new TesseractOCR();
    $ocr->executable($exePath); // Unquoted as per my last conclusion
    echo "Library instantiated.<br>";
    echo "Attempting run with missing file (should verify command exists)...<br>";
    $ocr->image('missing_file.jpg'); 
    $ocr->run();
    
} catch (Exception $e) {
    echo "Library Error: " . $e->getMessage() . "<br>";
}
