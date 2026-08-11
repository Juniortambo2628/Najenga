<?php
require dirname(__DIR__) . '/vendor/autoload.php';

use thiagoalessio\TesseractOCR\TesseractOCR;

echo "<h1>OCR Debugger</h1>";

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
// Try running version command
exec('"' . $exePath . '" --version 2>&1', $output, $return_var);

echo "Return Var: $return_var<br>";
echo "Output:<pre>" . implode("\n", $output) . "</pre>";

echo "<h2>3. Library Test</h2>";
try {
    $ocr = new TesseractOCR();
    $ocr->executable($exePath);
    // Create a dummy image or just check availability if possible, 
    // but the library checks command existence on instantiation or run options.
    // We'll try to version check via library reflections or just catch the error on empty run?
    // Actually, let's just try to process a dummy text file if we can, 
    // but for now let's just see if we can instantiate and maybe set a simple image.
    
    echo "Library instantiated.<br>";
    
    // Attempting to run on a non-existent image to force a different error than "command not found"
    // If command is found, it should complain about input file. 
    // If command NOT found, it complains about command.
    $ocr->image('missing_file.jpg'); 
    $ocr->run();
    
} catch (Exception $e) {
    echo "Library Error: " . $e->getMessage() . "<br>";
}
