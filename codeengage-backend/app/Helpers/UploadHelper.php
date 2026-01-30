<?php

namespace App\Helpers;

use App\Helpers\ApiResponse;

class UploadHelper
{
    /**
     * Upload an image file
     * 
     * @param array $file $_FILES item
     * @param string $destinationDir Relative to storage/public
     * @param int $maxSize Max size in bytes (default 2MB)
     * @return string Public URL path to the file
     */
    public static function uploadImage(array $file, string $destinationDir = 'uploads/avatars', int $maxSize = 2097152): string
    {
        // 1. Check for upload errors
        if ($file['error'] !== UPLOAD_ERR_OK) {
            throw new \Exception('File upload error code: ' . $file['error']);
        }

        // 2. Validate Size
        if ($file['size'] > $maxSize) {
            throw new \Exception('File size exceeds limit');
        }

        // 3. Validate MIME Type
        $finfo = new \finfo(FILEINFO_MIME_TYPE);
        $mimeType = $finfo->file($file['tmp_name']);
        
        $allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!in_array($mimeType, $allowedMimes)) {
            throw new \Exception('Invalid file type. Allowed: JPG, PNG, GIF, WEBP');
        }

        // 4. Generate Safe Filename
        $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
        $filename = bin2hex(random_bytes(16)) . '.' . $extension;
        
        // 5. Ensure Directory Exists
        // We assume public/uploads is the web root for assets in this setup, 
        // or we store in storage/app/public and symlink.
        // For simplicity in this PHP, let's put it in public/uploads directly.
        $publicPath = __DIR__ . '/../../public/' . $destinationDir;
        
        if (!is_dir($publicPath)) {
            mkdir($publicPath, 0755, true);
        }

        // 6. Move File
        $finalPath = $publicPath . '/' . $filename;
        if (!move_uploaded_file($file['tmp_name'], $finalPath)) {
             throw new \Exception('Failed to save uploaded file');
        }

        return '/' . $destinationDir . '/' . $filename;
    }
}
