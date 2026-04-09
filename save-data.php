<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'error' => 'Method not allowed']);
  exit;
}

$raw = file_get_contents('php://input');
if ($raw === false) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'No input received']);
  exit;
}

$decoded = json_decode($raw, true);
if (json_last_error() !== JSON_ERROR_NONE) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Input is not valid JSON']);
  exit;
}

$encoded = json_encode(
  $decoded,
  JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
);
if ($encoded === false) {
  http_response_code(400);
  echo json_encode(['ok' => false, 'error' => 'Failed to encode JSON']);
  exit;
}

$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'Data directory not found']);
  exit;
}

$timestamp = date('Ymd-His');
$versionedPath = $dataDir . "/data-{$timestamp}.json";
$latestPath = $dataDir . "/data.json";

if (file_put_contents($versionedPath, $encoded . PHP_EOL, LOCK_EX) === false) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'Failed to write versioned file']);
  exit;
}

if (file_put_contents($latestPath, $encoded . PHP_EOL, LOCK_EX) === false) {
  http_response_code(500);
  echo json_encode(['ok' => false, 'error' => 'Failed to write latest file']);
  exit;
}

echo json_encode(['ok' => true, 'timestamp' => $timestamp]);
