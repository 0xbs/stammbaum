<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
  exit;
}

if (!isset($_FILES['avatar'])) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'No file uploaded']);
  exit;
}

$file = $_FILES['avatar'];
if ($file['error'] !== UPLOAD_ERR_OK) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Upload error']);
  exit;
}

$originalName = $file['name'] ?? '';
$lowerName = strtolower($originalName);
if (!str_ends_with($lowerName, '.jpg') && !str_ends_with($lowerName, '.jpeg')) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Only JPG files allowed']);
  exit;
}

$imageInfo = @getimagesize($file['tmp_name']);
if ($imageInfo === false || ($imageInfo[2] ?? null) !== IMAGETYPE_JPEG) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Invalid JPG image']);
  exit;
}

$avatarsDir = __DIR__ . '/avatars';
if (!is_dir($avatarsDir)) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'Avatars directory not found']);
  exit;
}

$baseName = basename($originalName);
$targetPath = $avatarsDir . '/' . $baseName;

if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'Failed to save uploaded file']);
  exit;
}

echo json_encode(['ok' => true, 'filename' => $baseName]);
