<?php

try {
    $pdo = new PDO('mysql:host=127.0.0.1;port=3306', 'root', '');
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $pdo->exec('CREATE DATABASE IF NOT EXISTS pemesanantiket CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
    echo "SUCCESS: Database 'pemesanantiket' is ready.\n";
} catch (Exception $e) {
    echo 'ERROR: '.$e->getMessage()."\n";
    exit(1);
}
